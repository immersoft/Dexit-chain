// Copyright 2017 The go-ethereum Authors
// This file is part of the go-ethereum library.
//
// The go-ethereum library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The go-ethereum library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the go-ethereum library. If not, see <http://www.gnu.org/licenses/>.

package parlia

import (
	"bytes"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"sort"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/consensus"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethdb"
	"github.com/ethereum/go-ethereum/internal/ethapi"
	"github.com/ethereum/go-ethereum/params"
	lru "github.com/hashicorp/golang-lru"
)

// Snapshot is the state of the validatorSet at a given point.
type Snapshot struct {
	config   *params.ParliaConfig // Consensus engine parameters to fine tune behavior
	ethAPI   *ethapi.PublicBlockChainAPI
	sigCache *lru.ARCCache // Cache of recent block signatures to speed up ecrecover

	Number           uint64                      `json:"number"`             // Block number where the snapshot was created
	Hash             common.Hash                 `json:"hash"`               // Block hash where the snapshot was created
	Validators       map[common.Address]struct{} `json:"validators"`         // Set of authorized validators at this moment
	Recents          map[uint64]common.Address   `json:"recents"`            // Set of recent validators for spam protections
	RecentForkHashes map[uint64]string           `json:"recent_fork_hashes"` // Set of recent forkHash
}

// newSnapshot creates a new snapshot with the specified startup parameters. This
// method does not initialize the set of recent validators, so only ever use it for
// the genesis block.
func newSnapshot(
	config *params.ParliaConfig,
	sigCache *lru.ARCCache,
	number uint64,
	hash common.Hash,
	validators []common.Address,
	ethAPI *ethapi.PublicBlockChainAPI,
) *Snapshot {
	snap := &Snapshot{
		config:           config,
		ethAPI:           ethAPI,
		sigCache:         sigCache,
		Number:           number,
		Hash:             hash,
		Recents:          make(map[uint64]common.Address),
		RecentForkHashes: make(map[uint64]string),
		Validators:       make(map[common.Address]struct{}),
	}
	for _, v := range validators {
		snap.Validators[v] = struct{}{}
	}
	return snap
}

// validatorsAscending implements the sort interface to allow sorting a list of addresses
type validatorsAscending []common.Address

func (s validatorsAscending) Len() int           { return len(s) }
func (s validatorsAscending) Less(i, j int) bool { return bytes.Compare(s[i][:], s[j][:]) < 0 }
func (s validatorsAscending) Swap(i, j int)      { s[i], s[j] = s[j], s[i] }

// loadSnapshot loads an existing snapshot from the database.
func loadSnapshot(config *params.ParliaConfig, sigCache *lru.ARCCache, db ethdb.Database, hash common.Hash, ethAPI *ethapi.PublicBlockChainAPI) (*Snapshot, error) {
	blob, err := db.Get(append([]byte("parlia-"), hash[:]...))
	if err != nil {
		return nil, err
	}
	snap := new(Snapshot)
	if err := json.Unmarshal(blob, snap); err != nil {
		return nil, err
	}
	snap.config = config
	snap.sigCache = sigCache
	snap.ethAPI = ethAPI

	return snap, nil
}

// store inserts the snapshot into the database.
func (s *Snapshot) store(db ethdb.Database) error {
	blob, err := json.Marshal(s)
	if err != nil {
		return err
	}
	return db.Put(append([]byte("parlia-"), s.Hash[:]...), blob)
}

// copy creates a deep copy of the snapshot
func (s *Snapshot) copy() *Snapshot {
	cpy := &Snapshot{
		config:           s.config,
		ethAPI:           s.ethAPI,
		sigCache:         s.sigCache,
		Number:           s.Number,
		Hash:             s.Hash,
		Validators:       make(map[common.Address]struct{}),
		Recents:          make(map[uint64]common.Address),
		RecentForkHashes: make(map[uint64]string),
	}

	for v := range s.Validators {
		cpy.Validators[v] = struct{}{}
	}
	for block, v := range s.Recents {
		cpy.Recents[block] = v
	}
	for block, id := range s.RecentForkHashes {
		cpy.RecentForkHashes[block] = id
	}
	return cpy
}

func (s *Snapshot) isMajorityFork(forkHash string) bool {
	ally := 0
	for _, h := range s.RecentForkHashes {
		if h == forkHash {
			ally++
		}
	}
	return ally > len(s.RecentForkHashes)/2
}

func (s *Snapshot) apply(headers []*types.Header, chain consensus.ChainHeaderReader, parents []*types.Header, chainId *big.Int) (*Snapshot, error) {
	fmt.Println("Inside apply() in snapshot.go")
	// Allow passing in no headers for cleaner code
	fmt.Println("headers")
	fmt.Println(headers)
	if len(headers) == 0 {
		fmt.Println("Inside apply() inside 1st 'if' in snapshot.go")
		return s, nil
	}
	fmt.Println("Inside apply() after 1st 'if' in snapshot.go")
	// Sanity check that the headers can be applied
	for i := 0; i < len(headers)-1; i++ {
		if headers[i+1].Number.Uint64() != headers[i].Number.Uint64()+1 {
			return nil, errOutOfRangeChain
		}
		if !bytes.Equal(headers[i+1].ParentHash.Bytes(), headers[i].Hash().Bytes()) {
			return nil, errBlockHashInconsistent
		}
	}
	fmt.Println("Inside apply() after 1st 'for' in snapshot.go")
	if headers[0].Number.Uint64() != s.Number+1 {
		return nil, errOutOfRangeChain
	}
	fmt.Println("Inside apply() after 2nd 'if' in snapshot.go")
	if !bytes.Equal(headers[0].ParentHash.Bytes(), s.Hash.Bytes()) {
		return nil, errBlockHashInconsistent
	}
	fmt.Println("Inside apply() after 3rd 'if' in snapshot.go")
	// Iterate through the headers and create a new snapshot
	snap := s.copy()
	fmt.Println("snap")
	fmt.Println(snap)

	for _, header := range headers {
		number := header.Number.Uint64()
		fmt.Println("number")
		fmt.Println(number)
		limit1 := uint64(len(snap.Validators)/2 + 1)
		fmt.Println("limit1")
		fmt.Println(limit1)
		// Delete the oldest validator from the recent list to allow it signing again
		if number >= limit1 {

			delete(snap.Recents, number-limit1)
		}
		limit2 := uint64(len(snap.Validators))
		fmt.Println("limit2")
		fmt.Println(limit2)
		if limit2 := uint64(len(snap.Validators)); number >= limit2 {
			delete(snap.RecentForkHashes, number-limit2)
		}
		// Resolve the authorization key and check against signers
		validator, err := ecrecover(header, s.sigCache, chainId)
		fmt.Println("validator")
		fmt.Println(validator)
		if err != nil {
			return nil, err
		}
		if _, ok := snap.Validators[validator]; !ok {
			fmt.Println("errUnauthorizedValidator in apply()")
			return nil, errUnauthorizedValidator
		}
		for _, recent := range snap.Recents {
			fmt.Println("recent")
			fmt.Println(recent)
			if recent == validator {
				return nil, errRecentlySigned
			}
		}
		snap.Recents[number] = validator
		// change validator set
		fmt.Println("Checking epoch")
		if number > 0 && number%s.config.Epoch == uint64(len(snap.Validators)/2) {
			checkpointHeader := FindAncientHeader(header, uint64(len(snap.Validators)/2), chain, parents)
			fmt.Println("checkpointHeader")
			fmt.Println(checkpointHeader)
			if checkpointHeader == nil {
				return nil, consensus.ErrUnknownAncestor
			}

			validatorBytes := checkpointHeader.Extra[extraVanity : len(checkpointHeader.Extra)-extraSeal]
			fmt.Println("validatorBytes")
			fmt.Println(validatorBytes)
			// get validators from headers and use that for new validator set
			newValArr, err := ParseValidators(validatorBytes)
			fmt.Println("newValArr")
			fmt.Println(newValArr)
			if err != nil {
				return nil, err
			}
			newVals := make(map[common.Address]struct{}, len(newValArr))
			fmt.Println("newVals")
			fmt.Println(newVals)
			for _, val := range newValArr {
				newVals[val] = struct{}{}
			}
			oldLimit := len(snap.Validators)/2 + 1
			newLimit := len(newVals)/2 + 1
			if newLimit < oldLimit {
				for i := 0; i < oldLimit-newLimit; i++ {
					delete(snap.Recents, number-uint64(newLimit)-uint64(i))
				}
			}
			oldLimit = len(snap.Validators)
			newLimit = len(newVals)
			if newLimit < oldLimit {
				for i := 0; i < oldLimit-newLimit; i++ {
					delete(snap.RecentForkHashes, number-uint64(newLimit)-uint64(i))
				}
			}
			snap.Validators = newVals
			fmt.Println("snap.Validators")
			fmt.Println(snap.Validators)
		}
		snap.RecentForkHashes[number] = hex.EncodeToString(header.Extra[extraVanity-nextForkHashSize : extraVanity])
		fmt.Println("snap.RecentForkHashes")
		fmt.Println(snap.RecentForkHashes)
	}
	snap.Number += uint64(len(headers))
	fmt.Println("snap.Number")
	fmt.Println(snap.Number)
	snap.Hash = headers[len(headers)-1].Hash()
	fmt.Println("snap.Hash")
	fmt.Println(snap.Hash)
	return snap, nil
}

// validators retrieves the list of validators in ascending order.
func (s *Snapshot) validators() []common.Address {
	validators := make([]common.Address, 0, len(s.Validators))
	for v := range s.Validators {
		validators = append(validators, v)
	}
	sort.Sort(validatorsAscending(validators))
	return validators
}

// inturn returns if a validator at a given block height is in-turn or not.
func (s *Snapshot) inturn(validator common.Address) bool {
	validators := s.validators()
	offset := (s.Number + 1) % uint64(len(validators))
	return validators[offset] == validator
}

func (s *Snapshot) enoughDistance(validator common.Address, header *types.Header) bool {
	idx := s.indexOfVal(validator)
	if idx < 0 {
		return true
	}
	validatorNum := int64(len(s.validators()))
	if validatorNum == 1 {
		return true
	}
	if validator == header.Coinbase {
		return false
	}
	offset := (int64(s.Number) + 1) % validatorNum
	if int64(idx) >= offset {
		return int64(idx)-offset >= validatorNum-2
	} else {
		return validatorNum+int64(idx)-offset >= validatorNum-2
	}
}

func (s *Snapshot) indexOfVal(validator common.Address) int {
	validators := s.validators()
	for idx, val := range validators {
		if val == validator {
			return idx
		}
	}
	return -1
}

func (s *Snapshot) supposeValidator() common.Address {
	validators := s.validators()
	index := (s.Number + 1) % uint64(len(validators))
	return validators[index]
}

func ParseValidators(validatorsBytes []byte) ([]common.Address, error) {
	if len(validatorsBytes)%validatorBytesLength != 0 {
		return nil, errors.New("invalid validators bytes")
	}
	n := len(validatorsBytes) / validatorBytesLength
	result := make([]common.Address, n)
	for i := 0; i < n; i++ {
		address := make([]byte, validatorBytesLength)
		copy(address, validatorsBytes[i*validatorBytesLength:(i+1)*validatorBytesLength])
		result[i] = common.BytesToAddress(address)
	}
	return result, nil
}

func FindAncientHeader(header *types.Header, ite uint64, chain consensus.ChainHeaderReader, candidateParents []*types.Header) *types.Header {
	ancient := header
	for i := uint64(1); i <= ite; i++ {
		parentHash := ancient.ParentHash
		parentHeight := ancient.Number.Uint64() - 1
		found := false
		if len(candidateParents) > 0 {
			index := sort.Search(len(candidateParents), func(i int) bool {
				return candidateParents[i].Number.Uint64() >= parentHeight
			})
			if index < len(candidateParents) && candidateParents[index].Number.Uint64() == parentHeight &&
				candidateParents[index].Hash() == parentHash {
				ancient = candidateParents[index]
				found = true
			}
		}
		if !found {
			ancient = chain.GetHeader(parentHash, parentHeight)
			found = true
		}
		if ancient == nil || !found {
			return nil
		}
	}
	return ancient
}
