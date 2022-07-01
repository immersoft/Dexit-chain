// SPDX-License-Identifier: MIT
pragma solidity 0.6.4;
import "./System.sol";
import "./lib/BytesToTypes.sol";
import "./lib/Memory.sol";
import "./interface/IRewardRegister.sol";
import "./interface/IBSCValidatorSet.sol";
import "./lib/SafeMath.sol";

contract RewardRegister is System, IRewardRegister{
    using SafeMath for uint256;

    /**************************rewardRegister***********************/
    mapping(address => address) public rewardAddresses;
    mapping(address => uint256) public rewardAmountOwner;
    mapping(address => uint256) public rewardClaimRecords;
    address[] eligibleOwners;
    uint64 public constant RewardClaimingPeriod = 25; //24 hrs 21600

     function init() external onlyNotInit {
        alreadyInit = true;
    }

    function registerContract(address contractAddr, address payable rewardAddr)
        external
        returns (bool)
    {
        require(
            contractAddr != address(0x0) && rewardAddr != address(0x0),
            "0x0 found"
        );
        require(
            rewardAddresses[contractAddr] == address(0),
            "Already registered"
        );
        require(isContract(contractAddr), "contractAddr isn't contract");
        rewardAddresses[contractAddr] = rewardAddr;
        rewardAmountOwner[rewardAddr] = 0;
        return true;
    }

    function checkEligible(address[] calldata contractAddr)
        external
        override
        onlyValidatorContract
        returns (address[] memory)
    {
        delete eligibleOwners;
        for (uint256 i = 0; i < contractAddr.length; i++) {
            if (rewardAddresses[contractAddr[i]] != address(0x0)) {
                address owner = rewardAddresses[contractAddr[i]];
                eligibleOwners.push(owner);
            }
        }
        return eligibleOwners;
    }

    function distributeRewardToOwners(uint256 rewardOwners)
        external
        onlyValidatorContract
        override
        returns (bool)
    {
        uint256 rewardPerOwner = rewardOwners.div(eligibleOwners.length);
        for (uint256 i = 0; i < eligibleOwners.length; i++) {
            rewardAmountOwner[eligibleOwners[i]] += rewardPerOwner;
        }
        return true;
    }

    function transferRewardOwner(address owner) external override onlyValidatorContract returns (uint256) {
        require(owner != address(0), "Zero Address");
        require(
            rewardAmountOwner[owner] > 0,
            "Nothing to claim or Not Registered "
        );
        uint256 reward = rewardAmountOwner[owner];
        uint256 oldClaimTime = rewardClaimRecords[owner];
        if (oldClaimTime == 0) {
            rewardClaimRecords[owner] = block.number;
            rewardAmountOwner[owner] = 0;
            return reward;
        } else {
            uint256 endTime = oldClaimTime + RewardClaimingPeriod;
            require(block.number >= endTime, "Claim after 24 hours");
            rewardClaimRecords[owner] = block.number;
            rewardAmountOwner[owner] = 0;
            return reward;
        }   
    }
}