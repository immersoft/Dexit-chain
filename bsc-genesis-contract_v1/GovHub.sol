// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;
import "./System.sol";
import "./interface/IBSCValidatorSet.sol";

contract GovHub is System {
    
    IBSCValidatorSet public ibsc;
   
    struct ProposalInfo {
        address payable proposer;
        // propose who to be a validator
        address dst;
        string details;
        uint256 createTime;
        string variable_name;
        uint256 variable_value;
        //access of voting
        bool access;
        //Vote Power
        uint256 votePowerOfAgree;
        uint256 votePowerOfDisagree;
        uint16 agree;
        uint16 reject;
        bool ispassed;
        bool resultExist;
    }

    struct VoteInfo {
        address voter;
        uint256 voteTime;
        bool auth;
    }

    struct StartVoteInfo {
        address voter;
        uint256 voteTime;
    }

    struct ActiveProposal {
        mapping(address => bool) isEligible;
        mapping(address => uint256) individualCoins;
        uint256 totalVotePower;
    }

    mapping(bytes32 => ActiveProposal) public activeProposalMap;
    mapping(bytes32 => ProposalInfo) public proposals;
    mapping(address => mapping(bytes32 => VoteInfo)) public votes;
    mapping(address => bytes32[]) public userProposals;
    mapping(bytes32 => mapping(address => bool)) public pass;
    mapping(address => mapping(bytes32 => StartVoteInfo)) public startvotes;
  
    uint256 public maxValidators;
    uint256 public minimumStakeAmount;

    address[] public highestValidators; 

    bytes32[] ProposalsArray;
    uint256 public constant PROPOSAL_LASTING_PERIOD = 10 days;
    uint256 public votePower;

/*******************Events*****************/
    event LogCreateProposal(
        bytes32 indexed id,
        address indexed proposer,
        address indexed dst,
        uint256 time
    );
    event LogVote(
        bytes32 indexed id,
        address indexed voter,
        bool auth,
        uint256 time
    );
    event LogPassProposal(
        bytes32 indexed id,
        address indexed dst,
        uint256 time
    );
    event LogRejectProposal(
        bytes32 indexed id,
        address indexed dst,
        uint256 time
    );
    event LogSetUnpassed(
      address indexed val,
      uint256 time
    );

/*******************Modifiers*******************/
    modifier onlyValidator(address addr) {
        require(ibsc.isActiveValidator(addr), "Validator only");
        _;
    }

/*******************Functions*******************/
    function checkProposal() external view returns (bytes32[] memory) {
        return ProposalsArray;
    }

    function authChangeValues(bytes32 id) private{    
        if (
            keccak256(bytes(proposals[id].variable_name)) ==
            keccak256(bytes("minimumStakeAmount")) ||
            keccak256(bytes(proposals[id].variable_name)) ==
            keccak256(bytes("maxValidators"))
        ) {
                ibsc.updateVotingValues(proposals[id].variable_name,
                proposals[id].variable_value);
        }
       pass[id][msg.sender] = false;
    }

    function createProposal(
        string calldata details,
        string calldata vari_name,
        uint256 value
    ) external payable returns (bool) { 
        ibsc = IBSCValidatorSet(VALIDATOR_CONTRACT_ADDR);
        delete highestValidators;
        highestValidators = ibsc.getValidators();
        address dst = msg.sender;
        (IBSCValidatorSet.Status status) = ibsc.getStatus(dst);
        require(status == IBSCValidatorSet.Status.Staked, "Only Active Validator"); 
        require(
            keccak256(bytes(vari_name)) == keccak256(bytes("maxValidators")) ||
                keccak256(bytes(vari_name)) ==
                keccak256(bytes("minimumStakeAmount")),
            "maxValidators & minimumStakeAmount Proposal Only"
        );
        require(msg.value == 5000 ether, "Must pay 5000 DXT");
        bytes32[] memory UserProposal = userProposal();

        for (uint256 i = 0; i < UserProposal.length; i++) {
            if (
                keccak256(
                    bytes(proposals[UserProposal[i]].variable_name)
                ) ==
                keccak256(bytes(vari_name))){
                require(block.timestamp >= proposals[UserProposal[i]].createTime + PROPOSAL_LASTING_PERIOD, "proposal created before");
            }
        }

        if (keccak256(bytes(vari_name)) == keccak256(bytes("minimumStakeAmount"))) {
            require(value >= 1, "minimumStakeAmount can't be less than 1");

            value = value * 1 ether; 
           
             (uint256 highcoin) = ibsc.getCoins(highestValidators[0]);
             for (uint256 i = 1; i < highestValidators.length; i++) {
                (uint256 coin) = ibsc.getCoins(highestValidators[i]);
                if (coin > highcoin) {
                    highcoin = coin;
                }
            }
            //Validator can't create proposal that proposal amount > highCoin
            require(value <= highcoin, "set less than highcoin");
             minimumStakeAmount = ibsc.getMinimumStakeAmount();
        }

        if (keccak256(bytes(vari_name)) == keccak256(bytes("maxValidators"))) {
            if (value < 3 || value > ibsc.getCurrentValidators().length || value > 51)
                revert("Invalid Value");
                maxValidators = ibsc.getMaxValidators();
        }
        
        // generate proposal id
        bytes32 id = keccak256(
            abi.encodePacked(dst, dst, details, block.timestamp)
        );
        bytes32 pID = id;
        bytes32 uID = id;

        require(bytes(details).length <= 100, "Details too long");

        ActiveProposal storage activeInfo = activeProposalMap[id];
        uint256 updateCoins = 0;
        for (uint256 i = 0; i < highestValidators.length; i++) {
            address currentaddr = highestValidators[i];
            (uint256 coins) = ibsc.getCoins(currentaddr);
            activeInfo.isEligible[currentaddr] = true; 
            activeInfo.individualCoins[currentaddr] = coins; 
            updateCoins = updateCoins + coins;
        }
        activeInfo.totalVotePower = updateCoins;
       
        ProposalInfo memory proposal;
        proposal.proposer = payable(dst);
        proposal.dst = dst;
        proposal.details = details;
        proposal.createTime = block.timestamp;
        proposal.variable_name = vari_name;
        proposal.variable_value = value;
        proposal.access = true;
        proposal.votePowerOfAgree = 0;
        proposal.votePowerOfDisagree = 0;
        userProposals[proposal.proposer].push(uID);
        proposals[id] = proposal;
        ProposalsArray.push(pID);

        votePower = activeInfo.totalVotePower;
        emit LogCreateProposal(id, dst, dst, block.timestamp);
        return true;
    }

    function userProposal() public view returns (bytes32[] memory) {
        return userProposals[msg.sender];
    }

    //Apply for voting
    function startVoteProposal(bytes32 id) external {
        ActiveProposal storage activeInfo = activeProposalMap[id];
        bool isEligible = activeInfo.isEligible[msg.sender];
        require(block.timestamp < proposals[id].createTime + PROPOSAL_LASTING_PERIOD, "Proposal Expired");
        require(isEligible == true, "Not Eligible"); 
        require((startvotes[msg.sender][id].voteTime)==0 , "Already applied");
        require(proposals[id].createTime != 0, "Proposal not exist"); 
        require(proposals[id].access == true, "Voting completed for this ID"); 
        require(votes[msg.sender][id].voteTime == 0, "You can't vote for a proposal twice"); 
        
        startvotes[msg.sender][id].voteTime = block.timestamp;
        startvotes[msg.sender][id].voter = msg.sender;
    }

    function voteProposal(bytes32 id, string calldata vote)
        external
        returns (bool)
    {
        bool auth;
        ActiveProposal storage activeInfo = activeProposalMap[id];
        bool isEligible = activeInfo.isEligible[msg.sender];

        require(block.timestamp < proposals[id].createTime + PROPOSAL_LASTING_PERIOD, "Proposal Expired"); 
        require(isEligible == true, "Not Eligible"); 
        require((startvotes[msg.sender][id].voteTime)!=0 , "Apply for vote first");
        require((startvotes[msg.sender][id].voteTime + 48 hours) <= block.timestamp, "Can't vote before time lock"); 
        require(proposals[id].createTime != 0, "Proposal not exist"); 
        require(proposals[id].access == true, "Voting completed for this ID"); 
        require(votes[msg.sender][id].voteTime == 0, "You can't vote for a proposal twice"); 
        
        //check vote
        if (keccak256(bytes(vote)) == keccak256(bytes("true"))) {
            auth = true;
        } else if ((keccak256(bytes(vote)) == keccak256(bytes("false")))) {
            auth = false;
        } else {
            revert("Invalid Vote");
        }
        uint256 icoin = activeInfo.individualCoins[msg.sender]; 
        if (auth) {
            proposals[id].votePowerOfAgree =
                proposals[id].votePowerOfAgree +
                icoin;
        } else {
            proposals[id].votePowerOfDisagree =
                proposals[id].votePowerOfDisagree +
                icoin;
        }

        votes[msg.sender][id].voteTime = block.timestamp;
        votes[msg.sender][id].voter = msg.sender;
        votes[msg.sender][id].auth = auth;

        emit LogVote(id, msg.sender, auth, block.timestamp);

        //count vote
        if (auth) {
            proposals[id].agree += 1;
        } else {
            proposals[id].reject += 1;
        }
        if (pass[id][proposals[id].dst] || proposals[id].resultExist) {
            return true; 
        }

        uint256 totalVotePower = activeInfo.totalVotePower;

        if (proposals[id].votePowerOfAgree >= (totalVotePower / 2) + 1) {
            pass[id][proposals[id].dst] = true;
            proposals[id].resultExist = true;
            proposals[id].proposer.transfer(4000 ether);
            authChangeValues(id);
            proposals[id].ispassed = true;
            proposals[id].access = false;
            emit LogPassProposal(id, proposals[id].dst, block.timestamp);
            return true;
        }
        if (proposals[id].votePowerOfDisagree >= (totalVotePower / 2) + 1) {
            proposals[id].resultExist = true;
            proposals[id].ispassed = false;
            proposals[id].access = false;
            emit LogRejectProposal(id, proposals[id].dst, block.timestamp);
        }
        return true;
    }

    function getActiveProposal(bytes32 _id)
        external
        view
        returns (
            bool,
            uint256,
            uint256
        )
    {
        ActiveProposal storage activeInfo = activeProposalMap[_id];
        uint256 icoins = activeInfo.individualCoins[msg.sender];
        bool isPresent = activeInfo.isEligible[msg.sender];
        uint256 tvp = activeInfo.totalVotePower;
        return (isPresent, icoins, tvp);
    }
}