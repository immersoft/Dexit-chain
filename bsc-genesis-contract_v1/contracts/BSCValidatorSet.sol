pragma solidity 0.6.4;

import "./System.sol";
import "./lib/BytesToTypes.sol";
import "./lib/Memory.sol";
import "./lib/SafeMath.sol";
import "./interface/ISlashIndicator.sol";
import "./interface/IBSCValidatorSet.sol";
import "./interface/IRewardRegister.sol";
// import "hardhat/console.sol";

contract BSCValidatorSet is IBSCValidatorSet, System {
    using SafeMath for uint256;

    uint8 public constant MISDEMEANOR_THRESHOLD = 50;
    uint8 public constant FELONY_THRESHOLD = 150;
    uint256 public misdemeanorThreshold;
    uint256 public felonyThreshold;
    
    uint256 public constant BURN_RATIO_SCALE = 100;
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    uint256 public constant INIT_BURN_RATIO = 1;
    uint256 public burnRatio;
    bool public burnRatioInitialized;

    //Delegator Struct
    struct Delegator {
        address delegatorAddress; //  delegator self address
        uint256 amount; // self stake
        uint256 unstakeblock; // unstakeblock = 0 means can stake if !=0 already unstake
        uint256 index; // index no represent in stakers array in Validator Struct
        uint256 income; // delegator income
        uint256 totalIncome;
    }

    // Validator Address  = > Get Validator Information
    mapping(address => Validator) validatorInfo;
    // Delegator Address => Validator Address =>Staking Info
    mapping(address => mapping(address => Delegator)) stakingInfo;
    //Get time of validator & delegator claiming reward
    mapping(address => uint256) public rewardClaimRecords;

    address[] public currentValidators; // All Validators
    address[] public highestValidators; // Only Top 21
    address[] public elegibleDel;

    

    uint256 public totalDXTStake; //  To DXT Stake Amount

    struct PunishRecord {
        uint256 missedBlockCounter;
        uint256 index;
        uint256 jailedTime;
        bool isPunished;
    }
    mapping(address => PunishRecord) punishRecord;
    address[] public punishValidator;

    /**********Constant**********/
    uint256 public constant minimum_Stake_Amount = 10000 ether; // Minimum Stake DXT
    uint256 public constant Max_Validators = 5; // Total Max Validator(5)
    uint64 public constant StakingLockPeriod = 151200; // Stake Locking Period(7 days) //151200 blocks
    uint64 public constant unjailingPeriod = 2 days; //2 days
    uint64 public constant RewardClaimingPeriod = 21600; //24 hrs 21600

    uint256 public minimumStakeAmount;
    uint256 public MaxValidators;
    uint256 public PreMaxValidators;

    /**********Events**********/
    event StakeValidator(address indexed validator, uint256 amount);
    event StakeDelegator(address indexed delegator, address indexed validator, uint256 amount);
    event RemoveFromHighestValidators(address indexed validator);
    event RemoveFromCurrentValidatorsList(address indexed validator);
    event UnstakeValidator(address indexed validator);
    event UnstakeDelegator(address indexed validator, address indexed delegator);
    event WithdrawValidatorStaking(address indexed validator, uint256 indexed amount);
    event WithdrawDelegatorStaking(address indexed delegator, address indexed validator, uint256 indexed amount);
    event DelegatorClaimReward(address indexed delegator, address indexed validator, uint256 amount);
    event ValidatorClaimReward(address indexed validator, uint256 amount);
    event PunishValidator(address indexed validator);
    event RemoveFromPunishValidator(address indexed validator);


    /*********************** modifiers **************************/
    modifier noEmptyDeposit() {
        require(msg.value > 0, "deposit value is zero");
        _;
    }
    modifier zeroAddress() {
        _zeroAddress();
        _;
    }
    modifier onlyValidator(){
        address addr = msg.sender;
        this._onlyValidator(addr);
        _;
    }
    function _zeroAddress() internal view {
        require(msg.sender != address(0), "Zero Address");
    }
    function _onlyValidator(address addr) external override view{
        require(this.isActiveValidator(addr), "Validator only");
    }

    /*********************** init **************************/
    function init() external onlyNotInit {
        burnRatio = INIT_BURN_RATIO;
        burnRatioInitialized = true;
        minimumStakeAmount = minimum_Stake_Amount;
        MaxValidators = Max_Validators;
        alreadyInit = true;
        misdemeanorThreshold = MISDEMEANOR_THRESHOLD;
        felonyThreshold = FELONY_THRESHOLD;        
    }

    /*********************** External Functions **************************/
     //function deposit(address valAddr) public payable {
    function deposit(address valAddr, address[] calldata _contractArray)
        external
        payable
        onlyCoinbase
        onlyInit
        noEmptyDeposit
    {

        Validator storage valInfo = validatorInfo[valAddr];
        
        uint256 value = msg.value;
        uint256 curBurnRatio;
        uint256 UpdatedCoins = valInfo.coins;
        
        if (burnRatioInitialized) {
            curBurnRatio = burnRatio;
        }
        if (value > 0 && curBurnRatio > 0) {
            uint256 toBurn = value.mul(curBurnRatio).div(BURN_RATIO_SCALE);
        if (toBurn > 0) {
                address(uint160(BURN_ADDRESS)).transfer(toBurn);
                value = value.sub(toBurn);
            }
        }

        if(valInfo.validator == address(0x0) && highestValidators.length == 0){
            valInfo.validator = valAddr;
            valInfo.status = IBSCValidatorSet.Status.NotExist;
            valInfo.income = valInfo.income.add(value);
            valInfo.TotalIncome = valInfo.TotalIncome.add(value);
            return;
        }

        if ((IRewardRegister(CROSS_CHAIN_CONTRACT_ADDR).checkEligible(_contractArray)).length > 0)
        {
            uint256 rewardOwners = value.mul(45).div(99);
            if ((IRewardRegister(CROSS_CHAIN_CONTRACT_ADDR).distributeRewardToOwners(rewardOwners)))
            value = value.sub(rewardOwners);
        }        

        require(valInfo.status != IBSCValidatorSet.Status.Jailed); // Check for Not Exist Or Jailed
        require(valInfo.status != IBSCValidatorSet.Status.Unstaked);

         delete elegibleDel;
         for (uint256 j = 0; j < valInfo.delegators.length; j++) {
            address curr = valInfo.delegators[j];
            Delegator storage stakeInfo = stakingInfo[curr][valAddr];
            uint256 delAmt = stakeInfo.amount;
        
            if(stakeInfo.unstakeblock == 0) {     
                elegibleDel.push(curr);
            } 
            else {
              UpdatedCoins = UpdatedCoins.sub(delAmt);
            }
             
         } 

        uint256 percentageToTransfer = valInfo.amount.mul(100).div(UpdatedCoins);

        uint256 rewardAmount = value.mul(percentageToTransfer).div(100);

        valInfo.income = valInfo.income.add(rewardAmount); // Reseting income of validator

        valInfo.TotalIncome = valInfo.TotalIncome.add(rewardAmount);

        uint256 remainingDelegatorRewardAmount = value.sub(rewardAmount); // Remaining delgators reward amount;

        uint256 totalCoinsByDelegators = UpdatedCoins.sub(valInfo.amount);

        distributeRewardToDelegators(
            remainingDelegatorRewardAmount,
            valAddr,
            totalCoinsByDelegators
        );
    }

    function getElibelDel() public view returns(address[] memory) {
        return elegibleDel;
    }
  
    /***********************Staking***************************/
 

    // Function for staking validators
    function stakeValidator() external payable zeroAddress returns (bool) {
        address staker = msg.sender; // validator address
        uint256 stakeamount = msg.value;
        //Struct Validator & Delegator
        Validator storage valInfo = validatorInfo[staker];
        Delegator storage stakeInfo = stakingInfo[staker][staker];

        require(stakeamount > 0, "Can't Stake 0 DXT");
        require(valInfo.status != Status.Jailed, "Validator Jailed");

        if (valInfo.amount == 0 && Status.NotExist == valInfo.status) {
            require(
                stakeamount >= minimumStakeAmount,
                "Must Stake 10000 DXT or More"
            );
            valInfo.validator = staker;
            valInfo.status = Status.Created;
            valInfo.amount = valInfo.amount.add(stakeamount);
            valInfo.coins = valInfo.coins.add(stakeamount);
        } else if (
            valInfo.amount > 0 &&
            (Status.Staked == valInfo.status ||
                Status.Unstaked == valInfo.status)
        ) {
            valInfo.amount = valInfo.amount.add(stakeamount);
            valInfo.coins = valInfo.coins.add(stakeamount);

            stakeInfo.unstakeblock = 0; // Update The Block No
        }

        if (
            highestValidators.length < MaxValidators && !this.isTopValidator(staker)
        ) {
            highestValidators.push(staker); // push into highestValidator if there is space
         } 
        else if (
            highestValidators.length >= MaxValidators &&
            !this.isTopValidator(staker) &&
            valInfo.status != IBSCValidatorSet.Status.Jailed
        ) {
            // Find The Lowest Coins Address & Index in HighestValidators List
            uint256 lowCoin;
            uint256 lowIdx;
            address lowAddress;
            (lowCoin, lowIdx, lowAddress) = this.lowestCoinsInHighestValidator();

            if (valInfo.coins > lowCoin) {
                highestValidators[lowIdx] = staker;
            }
        }

        // Change the Status to Staked
        if (valInfo.status != IBSCValidatorSet.Status.Staked) {
            valInfo.status =  IBSCValidatorSet.Status.Staked;
        }
        if (!this.isActiveValidator(staker)) {
            currentValidators.push(staker);
        }

        //Get highestValidator from currentValidator and push it into highestValidator list
        uint256 highCoin;
        uint256 highIdx;
        address addValAddress;
        (
            highCoin,
            highIdx,
            addValAddress
        ) = this.highestCoinsInCurrentValidatorsNotInTopValidator();

        if (
            highestValidators.length < MaxValidators &&
            addValAddress != address(0) && highCoin >= minimumStakeAmount
        ) {
            highestValidators.push(addValAddress);
        }

        totalDXTStake = totalDXTStake.add(stakeamount);
        emit StakeValidator(staker, stakeamount);
        return true;
    }

    //Function to Stake Delegators
    function stakeDelegator(address validator)
        external
        payable
        zeroAddress
        returns (bool)
    {
        address staker = msg.sender; //Delegator Address
        uint256 stakeamount = msg.value; // Stake Amount

        // Struct Validator & Delegator
        Validator storage valInfo = validatorInfo[validator];
        Delegator storage stakeInfo = stakingInfo[staker][validator];

        require(stakeamount > 0, "Can't stake 0 DXT");
        require(this.isActiveValidator(validator), "Validator Not Exist");
        require(Status.Staked == valInfo.status, "Validator Not Staked");

        if (stakeamount <= 0) {
            return false;
        }

        if (valInfo.status == Status.Staked && stakeInfo.amount == 0) {
            stakeInfo.delegatorAddress = staker; // update in Delegator Staking Struct
            stakeInfo.index = valInfo.delegators.length; // update the index of delegator struct for  delegators array in validator
            valInfo.delegators.push(staker);
        }
        if(stakeInfo.amount > 0) {
           stakeInfo.unstakeblock = 0;
        }

        valInfo.coins = valInfo.coins.add(stakeamount);
        stakeInfo.amount = stakeInfo.amount.add(stakeamount); // update in Validator Coins(Total)

        if (
            highestValidators.length < MaxValidators &&
            !this.isTopValidator(validator)
        ) {
            //console.log("this is push 337 : ",MaxValidators, minimumStakeAmount);
            highestValidators.push(validator); // push into highestValidator if there is space
        } else if (
            highestValidators.length >= MaxValidators &&
            !this.isTopValidator(validator)
        ) {
            // Find The Lowest Coins Address & Index in HighestValidators List
            uint256 lowCoin;
            uint256 lowIdx;
            address lowAddress;
            (lowCoin, lowIdx, lowAddress) = this.lowestCoinsInHighestValidator();

            if (valInfo.coins > lowCoin) {
                if (!this.isTopValidator(validator)) {
                    highestValidators[lowIdx] = validator;
                }
            }
        }

        emit StakeDelegator(staker, validator, stakeamount);
        totalDXTStake = totalDXTStake.add(stakeamount);
        return true;
    }

    //Function to UnStakeValidator
    function unstakeValidator() external zeroAddress returns (bool) {
        address staker = msg.sender; //get the validator address

        //Struct Validator & Delegator
        Validator storage valInfo = validatorInfo[staker];
        Delegator storage stakeInfo = stakingInfo[staker][staker];
        uint256 unstakeamount = valInfo.amount; // self amount validator

        // Check for the unstakeBlock status
        require(valInfo.status == Status.Staked, "Validator Should Staked");
        require(
            stakingInfo[staker][staker].unstakeblock == 0,
            "Already in Unstaking Status"
        );
        require(unstakeamount > 0, "Don't have any stake");
        require(
            highestValidators.length > 3 && this.isActiveValidator(staker),
            "Can't Unstake, Validator List Empty"
        );

        stakeInfo.unstakeblock = block.number; // Set Block No When Validator Unstake

        this.removeFromHighestValidatorList(staker); // Remove From The Highest

        valInfo.status = Status.Unstaked;
        // Get Highest Validator From Current List
        uint256 highCoin;
        uint256 highIdx;
        address addValAddress;

        (
            highCoin,
            highIdx,
            addValAddress
        ) = this.highestCoinsInCurrentValidatorsNotInTopValidator();

        if (
            highestValidators.length < MaxValidators &&
            addValAddress != address(0)
        ) {
            //console.log("this is push 402 : ",MaxValidators, minimumStakeAmount);
            highestValidators.push(addValAddress);
        }

        emit UnstakeValidator(staker);
        return true;
    }

    // //Function to UnStakeDelegator
    function unstakeDelegators(address validator)
        external
        zeroAddress
        returns (bool)
    {
        address delegator = msg.sender; //get Delegator Address
       
        Delegator storage stakeInfo = stakingInfo[delegator][validator]; // Struct Delegator
        uint256 unstakeamount = stakeInfo.amount; // get the staking info

        require(stakeInfo.unstakeblock == 0, "Already in unstaking status");
        require(unstakeamount > 0, "don't have any stake");

        stakeInfo.unstakeblock = block.number; // Update The Unstake Block for Deligator
    

        emit UnstakeDelegator(validator, delegator);
        return true;
    }


    //Function to WithdrawValidator staking after unstakeValidator
    function withdrawValidatorStaking(uint256 amount)
        external
        zeroAddress
        returns (bool)
    {
        address payable staker = msg.sender; // validator address
        Validator storage valInfo = validatorInfo[staker];
        Delegator storage stakeInfo = stakingInfo[staker][staker];

        require(
            amount <= valInfo.amount,
            "Can't Withdraw More Than Stake Amount"
        ); // Can't Unstake More Than Stake Amount
        require(stakeInfo.unstakeblock != 0, "Unstake First");
        require(
            stakeInfo.unstakeblock + StakingLockPeriod <= block.number,
            "Staking haven't unlocked yet"
        );

        uint256 updateBalance = valInfo.amount.sub(amount); // balance - amount

        valInfo.amount = valInfo.amount.sub(amount); // update the amount
        valInfo.coins = valInfo.coins.sub(amount); // Update Coins

        if (updateBalance >= minimumStakeAmount) {
            valInfo.status = Status.Staked; //  Change Status to Staked
        }

        if (updateBalance < minimumStakeAmount) {
            if (updateBalance == 0) {
                if (valInfo.income > 0) {
                    this.claimValidatorReward(); // Claim Validator Rewards If any
                }
                valInfo.status = Status.NotExist;
            } else {
                revert("Withdraw all at once");
            }
        }

        if (valInfo.amount == 0 && valInfo.coins == 0) {
            removeFromCurrentValidatorList(staker);
        }
        stakeInfo.unstakeblock = 0; // Reset The UnstakeBlock

        staker.transfer(amount); // Transfer the amount to validator

        // Find Lowest in Highest Validator
        uint256 lowestCoin;
        uint256 lowIdx;
        address lowValidator;
        (lowestCoin, lowIdx, lowValidator) = this.lowestCoinsInHighestValidator();

        // Find Highest Coins in Current Validator List
        uint256 highCoins;
        uint256 highIndex;
        address highValidator;
        (
            highCoins,
            highIndex,
            highValidator
        ) = this.highestCoinsInCurrentValidatorsNotInTopValidator();

        if (highCoins > lowestCoin) {
            highestValidators[lowIdx] = highValidator;
        } else if (
            highestValidators.length < MaxValidators &&
            highValidator != address(0) &&
            validatorInfo[highValidator].status != Status.Jailed
        ) {
            //console.log("this is push 502 : ",MaxValidators, minimumStakeAmount);
            highestValidators.push(highValidator);
        }
        //votePower = calcVotePower();
        emit WithdrawValidatorStaking(staker, amount);
        totalDXTStake = totalDXTStake.sub(amount);
        return true;
    }

    //Function to withdraw Delegator Staking
    function withdrawDelegatorStaking(address validator, uint256 amount)
        external
        zeroAddress
        returns (bool)
    {
        address payable staker = msg.sender; //Delegator Address

        Delegator storage stakeInfo = stakingInfo[staker][validator]; // Delegator Staking Info
        Validator storage valInfo = validatorInfo[validator]; // Validator

        require(
            amount <= stakeInfo.amount,
            "Can't Withdraw More Than Stake Amount"
        ); // Can not withdraw more than stake
        require(stakeInfo.unstakeblock != 0, "Unstake First");
        require(
            stakeInfo.unstakeblock + StakingLockPeriod <= block.number,
            "Staking haven't unlocked yet"
        );

        stakeInfo.amount = stakeInfo.amount.sub(amount);
        valInfo.coins = valInfo.coins.sub(amount); // Update The Coins in Validator Record
        stakeInfo.unstakeblock = 0;

        if (stakeInfo.amount == 0) {
            // Update The Validator Info
            if (stakeInfo.index != valInfo.delegators.length - 1) {
                valInfo.delegators[stakeInfo.index] = valInfo.delegators[
                    valInfo.delegators.length - 1
                ];
                //update index of staker
                stakingInfo[valInfo.delegators[stakeInfo.index]][validator]
                    .index = stakeInfo.index;
            }
            valInfo.delegators.pop();
        }

        // Find Lowest in Highest Validator
        uint256 lowestCoin;
        uint256 lowIdx;
        address lowValidator;
        (lowestCoin, lowIdx, lowValidator) = this.lowestCoinsInHighestValidator();

        // Find Highest Coins in Current Validator List
        uint256 highCoins;
        uint256 highIndex;
        address highValidator;
        (
            highCoins,
            highIndex,
            highValidator
        ) = this.highestCoinsInCurrentValidatorsNotInTopValidator();

        if (highCoins > lowestCoin) {
            highestValidators[lowIdx] = highValidator;
        }

        if (valInfo.coins == 0) {
            removeFromCurrentValidatorList(validator);
            valInfo.status = Status.NotExist;
        }

        staker.transfer(amount);
        //votePower = calcVotePower();

        emit WithdrawDelegatorStaking(staker, validator, amount);
        totalDXTStake = totalDXTStake.sub(amount);
        return true;
    }

    //Function to Validator Can Claim Reward
    function claimValidatorReward() external zeroAddress returns (bool) {
        address payable staker = msg.sender; // validator address
        Validator storage valInfo = validatorInfo[staker];
        uint256 oldClaimTime = rewardClaimRecords[staker];

        require(
            valInfo.status != Status.NotExist && valInfo.status != Status.Jailed
        ); // Check for Not Exist Or Jailed
        require(valInfo.income > 0, "No incomes yet.");

        uint256 rewardAmount = valInfo.income;

        if (oldClaimTime == 0) {
            rewardClaimRecords[staker] = block.number;
            staker.transfer(rewardAmount); // Transfering The Reward Amount
            valInfo.income = 0; // Reseting income of validator
        } else {
            uint256 endTime = oldClaimTime + RewardClaimingPeriod;
            require(block.number >= endTime, "Claim after 24 hours");
            staker.transfer(rewardAmount);
            rewardClaimRecords[staker] = block.number;
            valInfo.income = 0; // Reseting income of validator
        }
        emit ValidatorClaimReward(staker, rewardAmount);
        return true;
    }

    //Function to Delegator Can Claim Reward
    function claimDelegatorReward(address validator)
        external
        zeroAddress
        returns (bool)
    {
        address payable delegator = msg.sender; // delegator self address

        //Validator storage valInfo = validatorInfo[validator];
        Delegator storage stakeInfo = stakingInfo[delegator][validator]; // Get Delegators Info

        uint256 oldClaimTime = rewardClaimRecords[delegator];

        //require(valInfo.status != Status.Jailed, "Validator is Jailed"); // Check for Not Exist Or Jailed
        require(stakeInfo.income > 0, "No incomes yet.");
        uint256 staking = stakeInfo.income;

        if (stakeInfo.income <= 0) {
            return false; // return if income is zero
        }
        if (oldClaimTime == 0) {
            rewardClaimRecords[delegator] = block.number;
            delegator.transfer(staking); // transfer the income to delegators
            stakeInfo.income = 0;
        } else {
            uint256 endTime = oldClaimTime + RewardClaimingPeriod;
            require(block.number >= endTime, "Claim after 24 hours");
            delegator.transfer(staking);
            rewardClaimRecords[delegator] = block.number;
            stakeInfo.income = 0;
        }

        emit DelegatorClaimReward(delegator, validator, staking);
        return true;
    }

    //function transferRewardOwner(address payable owner) external returns (bool){
    function claimOwnerReward() external returns (bool){
        address payable owner = msg.sender;
        uint256 reward = IRewardRegister(CROSS_CHAIN_CONTRACT_ADDR).transferRewardOwner(owner);
        owner.transfer(reward);
        return true;
    }

    function distributeRewardToDelegators(
        uint256 rewardAmount,
        address validator,
        uint256 totalCoins
    ) private {
        Validator storage valInfo = validatorInfo[validator];

        if (valInfo.delegators.length <= 0) return;

        for (uint256 j = 0; j < elegibleDel.length; j++) {

            address currentAddr = elegibleDel[j];
            Delegator storage stakeInfo = stakingInfo[currentAddr][validator];
            uint256 stakeamount = stakeInfo.amount;
          
            uint256 percentageToTransfer = stakeamount.mul(100).div(totalCoins);
            
            uint256 rewardDelegatorAmount = rewardAmount
                .mul(percentageToTransfer)
                .div(100);

            stakeInfo.income = stakeInfo.income.add(rewardDelegatorAmount); // Reseting income of delegator
            stakeInfo.totalIncome = stakeInfo.totalIncome.add(
                rewardDelegatorAmount
            );
            
        }

    }

    /**********************Slashing**********************/

    function punish(address validator) external override {
        Validator storage valInfo = validatorInfo[validator];
        // Get Punish Record of the Validator
        PunishRecord storage punishInfo = punishRecord[validator];

        uint256 income = valInfo.income;

        if (!punishInfo.isPunished) {
            punishInfo.isPunished = true;
            punishInfo.index = punishValidator.length;
            punishValidator.push(validator);
        }
        // Increment the Block Counter
        punishInfo.missedBlockCounter = punishInfo.missedBlockCounter.add(1);

        if (punishInfo.missedBlockCounter % felonyThreshold == 0) {
            //  Change the Status to Jailed
            valInfo.status = Status.Jailed;
            //   votePower = totalDXTStake - validatorInfo[validator].coins;

            this.removeFromHighestValidatorList(validator);

            uint256 highCoin;
            uint256 highIdx;
            address addValAddress;
            (
                highCoin,
                highIdx,
                addValAddress
            ) = this.highestCoinsInCurrentValidatorsNotInTopValidator();

            if (
                highestValidators.length < MaxValidators &&
                addValAddress != address(0) &&
                validatorInfo[addValAddress].status != Status.Jailed
            ) {
                //console.log("this is push 722 : ",MaxValidators, minimumStakeAmount);
                highestValidators.push(addValAddress);
            }
            uint256 rest = highestValidators.length;

            uint256 averageDistribute = income.div(rest);
            distributeRewardIncomeExcept(averageDistribute);

            valInfo.income = 0;
            punishInfo.missedBlockCounter = 0;
            punishInfo.jailedTime = block.timestamp;
        } else if (
            punishInfo.missedBlockCounter % misdemeanorThreshold == 0 &&
            Status.Jailed != valInfo.status
        ) {
            uint256 rest = highestValidators.length - 1;

            uint256 averageDistribute = income.div(rest);
            // Logic to Distribute Income to Better Validators
            distributeRewardIncomeExcept(averageDistribute);
            // Reset the Validator Missed Block Counter
            valInfo.income = 0;
        }
        //votePower = calcVotePower();
        emit PunishValidator(validator);
    }

    //Function to Unjailed the validator
    function unJailed() external payable returns (bool) {
        address requester = msg.sender; // validator address
        Validator storage valInfo = validatorInfo[requester];
        PunishRecord storage punishInfo = punishRecord[requester]; // Get The Punish Record

        uint256 endTime = punishInfo.jailedTime + unjailingPeriod; // Get The End Time

        require(block.timestamp >= endTime, "WaitToUnjail");
        require(msg.value == 1 ether, "Pay 1DXT"); // Need to Submit Only 1 DXT To Unjailed

        // Change Status To Staked
        valInfo.status = Status.Staked;

        if (
            highestValidators.length < MaxValidators && requester != address(0)
        ) {
            //console.log("this is push 766 : ",MaxValidators, minimumStakeAmount);
            highestValidators.push(requester);
        } else {
            // Get The Highest from Current
            uint256 highCoin;
            uint256 highIdx;
            address addValAddress;
            (
                highCoin,
                highIdx,
                addValAddress
            ) = this.highestCoinsInCurrentValidatorsNotInTopValidator();

            //Get The Lowest from Highest
            uint256 lowCoin;
            uint256 lowIdx;
            address lowAddress;
            (lowCoin, lowIdx, lowAddress) = this.lowestCoinsInHighestValidator();

            if (highCoin > lowCoin) {
                highestValidators[lowIdx] = addValAddress;
            }

            // Reset Punish Record
            punishInfo.jailedTime = 0;
            punishInfo.index = 0;
            punishInfo.isPunished = false;

            removeFromPunishValidator(requester); // Remove From Punish Record
            //votePower = calcVotePower();
        }
    }

    //Function to distribute reward income
    function distributeRewardIncomeExcept(uint256 averageDistribute) private {
        if (averageDistribute != 0) {
            for (uint256 i = 0; i < highestValidators.length; i++) {
                validatorInfo[highestValidators[i]].income = validatorInfo[
                    highestValidators[i]
                ].income.add(averageDistribute);
            }
        }
    }

    /********************Internal Functions******************/

    function isActiveValidator(address who) external override view returns (bool) {
        for (uint256 k = 0; k < currentValidators.length; k++) {
            if (who == currentValidators[k]) {
                return true;
            }
        }
        return false;
    }

    function isDelegatorsExist(address who, address[] memory delegators)
        private
        pure
        returns (bool)
    {
        for (uint256 k = 0; k < delegators.length; k++) {
            if (who == delegators[k]) {
                return true;
            }
        }

        return false;
    }


    function removeFromHighestValidatorList(address val) external override {
        uint256 n = highestValidators.length;
        for (uint256 k = 0; k < n && n > 1; k++) {
            if (val == highestValidators[k]) {
                if (k != n - 1) {
                    highestValidators[k] = highestValidators[n - 1]; //Swapping of addresses and plced unstake validator into last index so that we can pop.
                }
                highestValidators.pop();
                emit RemoveFromHighestValidators(val);
                break;
            }
        }
    }

    function removeFromCurrentValidatorList(address val) private {
        uint256 n = currentValidators.length;
        for (uint256 i = 0; i < n && n > 1; i++) {
            if (val == currentValidators[i]) {
                if (i != n - 1) {
                    currentValidators[i] = currentValidators[n - 1];
                }
                currentValidators.pop();
                emit RemoveFromCurrentValidatorsList(val);
                break;
            }
        }
    }

    function removeFromPunishValidator(address val) private {
        uint256 n = punishValidator.length;
        for (uint256 j = 0; j < n; j++) {
            if (val == punishValidator[j]) {
                if (j != n - 1) {
                    punishValidator[j] = punishValidator[n - 1];
                }
                punishValidator.pop();
                emit RemoveFromPunishValidator(val);
                break;
            }
        }
    }

    
    function lowestCoinsInHighestValidator()
        external
        override
        view
        returns (
            uint256,
            uint256,
            address
        )
    {
        uint256 lowestCoin = validatorInfo[highestValidators[0]].coins; //first validator coins
        uint256 lowIndex = 0;
        address lowValidator = highestValidators[0];

        for (uint256 j = 1; j < highestValidators.length; j++) {
            if (validatorInfo[highestValidators[j]].coins < lowestCoin) {
                lowIndex = j;
                lowestCoin = validatorInfo[highestValidators[j]].coins;
                lowValidator = highestValidators[j];
            }
        }

        return (lowestCoin, lowIndex, lowValidator);
    }

    function highestCoinsInCurrentValidatorsNotInTopValidator()
        external override
        view
        returns (
            uint256,
            uint256,
            address
        )
    {
        uint256 highCoins;
        uint256 highIndex;
        address highestValidatorAddress;

        for (uint256 k = 0; k < currentValidators.length; k++) {
            if (
                validatorInfo[currentValidators[k]].coins > highCoins &&
                !this.isTopValidator(currentValidators[k]) &&
                validatorInfo[currentValidators[k]].status == Status.Staked
            ) {
                highCoins = validatorInfo[currentValidators[k]].coins;
                highIndex = k;
                highestValidatorAddress = currentValidators[k];
            }
        }
        return (highCoins, highIndex, highestValidatorAddress);
    }

    function isTopValidator(address who) external override view returns (bool) {
        for (uint256 i = 0; i < highestValidators.length; i++) {
            if (who == highestValidators[i]) {
                return true;
            }
        }
        return false;
    }

  /**************getter methods*******************************/
    function getminimumStakeAmount() external override view returns (uint256) {
        return minimumStakeAmount;
    }

    function getMaxValidators() external override view returns (uint256) {
        return MaxValidators;
    }

    function getValidators() external override view returns (address[] memory) {
        return highestValidators;
    }
    
    function getValidatorInfo(address val)
        external
        override
        view
        returns (
            address,
            Status,
            uint256,
            uint256,
            uint256,
            uint256,
            address[] memory
        )
    {
        Validator memory v = validatorInfo[val];

        return (
            v.validator,
            v.status,
            v.amount,
            v.coins,
            v.income,
            v.TotalIncome,
            v.delegators
        );
    }

    function getStakingInfo(address staker, address val)
        public
        view
        returns (
            address,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        return (
            stakingInfo[staker][val].delegatorAddress,
            stakingInfo[staker][val].amount,
            stakingInfo[staker][val].unstakeblock,
            stakingInfo[staker][val].index,
            stakingInfo[staker][val].income,
            stakingInfo[staker][val].totalIncome
        );
    }

    function getCurrentValidators() external override view returns (address[] memory) {
        return currentValidators;
    }

    function getPunishValidators() public view returns (address[] memory) {
        return punishValidator;
    }

    function getPunishInfo(address validator)
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            bool
        )
    {
        PunishRecord memory p = punishRecord[validator];
        return (p.missedBlockCounter, p.index, p.jailedTime, p.isPunished);
    }

    function getBlockNumber() public view returns (uint256) {
        return block.number;
    }

    function getHighestValidators() public view returns (address[] memory) {
        return highestValidators;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    } 

    function updateVotingValues(string calldata variable_name, uint256 variable_value) external override onlyGov{
        // require(resultExist == false,"proposal Expired");
        if (
            keccak256(bytes(variable_name)) ==
            keccak256(bytes("minimumStakeAmount"))
        ) {
            minimumStakeAmount = variable_value;
            address lowValidator;
            while(true){
                (, , lowValidator) = this.lowestCoinsInHighestValidator();
                    (uint256 coins) = this.getCoins(lowValidator);
                if (highestValidators.length <= 3) {
                    break;
                } else if (
                    coins < minimumStakeAmount
                ) {
                    this.removeFromHighestValidatorList(lowValidator);
                } else {
                    break;
                }
            }
            if (highestValidators.length < MaxValidators) {
                uint256 validatorToAdd = MaxValidators -
                    highestValidators.length;

                for (uint256 i = 0; i < validatorToAdd; i++) {
                    (
                        ,
                        ,
                        address highestValidatorAddress
                    ) = this.highestCoinsInCurrentValidatorsNotInTopValidator();
                    (uint256 coins) = this.getCoins(highestValidatorAddress);
                    if (
                        coins >=
                        minimumStakeAmount &&
                        highestValidatorAddress != address(0)
                    ) {
                        highestValidators.push(highestValidatorAddress);
                    } else {
                        break;
                    }
                }
            }
        }
        if (
            keccak256(bytes(variable_name)) ==
            keccak256(bytes("MaxValidators"))
        ) {
            PreMaxValidators = MaxValidators;
            //removing the validators from highvalidator who donot qualify now
            if (variable_value < PreMaxValidators) {

                uint256 validatorToRemove = MaxValidators -
                    variable_value;
                for (uint256 i = 0; i < validatorToRemove; i++) {
                    (
                        ,
                        ,
                        address lowValidator
                    ) = this.lowestCoinsInHighestValidator();
                    this.removeFromHighestValidatorList(lowValidator);
                }
            }

            MaxValidators = variable_value;
            if (highestValidators.length < MaxValidators) {
                uint256 validatorToAdd = MaxValidators -
                    highestValidators.length;
                for (uint256 i = 0; i < validatorToAdd; i++) {
                    (
                        ,
                        ,
                        address highestValidatorAddress
                    ) = this.highestCoinsInCurrentValidatorsNotInTopValidator();
                    if (highestValidatorAddress != address(0)) {
                        highestValidators.push(highestValidatorAddress);
                    }
                }
            }
        }
    }

    function getStatus(address val) external override view returns (Status){
        Validator memory v = validatorInfo[val];
        return (v.status);
    }

    function getCoins(address val) external override view returns (uint256){
        Validator memory v = validatorInfo[val];
        return (v.coins);
    }
}