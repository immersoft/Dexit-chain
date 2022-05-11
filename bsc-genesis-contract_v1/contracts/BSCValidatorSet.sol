pragma solidity 0.6.4;

import "./System.sol";
import "./lib/BytesToTypes.sol";
import "./lib/Memory.sol";
import "./interface/ISlashIndicator.sol";
import "./interface/IParamSubscriber.sol";
import "./interface/IBSCValidatorSet.sol";
import "./lib/SafeMath.sol";

contract BSCValidatorSet is IBSCValidatorSet, System {
    using SafeMath for uint256;

    uint256 public constant MISDEMEANOR_THRESHOLD = 50;
    uint256 public constant FELONY_THRESHOLD = 150;
    uint256 public constant EXPIRE_TIME_SECOND_GAP = 1000;
    uint256 public constant MAX_NUM_OF_VALIDATORS = 41;

    /*********************** state of the contract **************************/
    ValidatorBSC[] public currentValidatorSetBSC;
    uint256 public expireTimeSecondGap;
    uint256 public totalInComing;
    uint256 public misdemeanorThreshold;
    uint256 public felonyThreshold;

    // key is the `consensusAddress` of `Validator`,
    // value is the index of the element in `currentValidatorSetBSC`.
    mapping(address => uint256) public currentValidatorSetMapBSC;

    uint256 public constant BURN_RATIO_SCALE = 10000;
    uint256 public burnRatio;
    bool public burnRatioInitialized;

    struct ValidatorBSC {
        address consensusAddress;
        address payable feeAddress;
        address BBCFeeAddress;
        uint64 votingPower;
        // only in state
        bool jailed;
        uint256 incoming;
    }

    /*********************** cross chain package **************************/
    struct IbcValidatorSetPackage {
        uint8 packageType;
        ValidatorBSC[] validatorSet;
    }

    /*********************** modifiers **************************/
    modifier noEmptyDeposit() {
        require(msg.value > 0, "deposit value is zero");
        _;
    }
    modifier zeroAddress() {
        _zeroAddress();
        _;
    }
    modifier onlyValidator() {
        _onlyValidator();
        _;
    }

    /*********************** init **************************/
   function init() external onlyNotInit {
        expireTimeSecondGap = EXPIRE_TIME_SECOND_GAP;
        minimumStakeAmount = minimum_Stake_Amount;
        MaxValidators = Max_Validators;
        alreadyInit = true;
        misdemeanorThreshold = MISDEMEANOR_THRESHOLD;
        felonyThreshold = FELONY_THRESHOLD;
        proposalLastingPeriod = 3 days;  //3 days
        Validator storage valInfo = validatorInfo[0x95eEcd42Ec27db6ea66c45c21289dA4D9092f475];
        valInfo.validator = 0x95eEcd42Ec27db6ea66c45c21289dA4D9092f475;
        valInfo.status = Status.NotExist;
    }

    /*********************** External Functions **************************/
     //function deposit(address valAddr) public payable {
   function deposit(address valAddr)
        external
        payable
        onlyCoinbase
        onlyInit
        noEmptyDeposit
    {
        uint256 value = msg.value;
        Validator storage valInfo = validatorInfo[valAddr];

        require(valInfo.status != Status.Jailed); // Check for Not Exist Or Jailed
        require(valInfo.status != Status.Unstaked);

        if(valInfo.amount == 0){
           
            valInfo.income.add(value);
            valInfo.TotalIncome.add(value);
            return;
        }
        uint256 percentageToTransfer = valInfo.amount.mul(100).div(valInfo.coins);
     
        uint256 rewardAmount = value.mul(percentageToTransfer).div(100);
      
        valInfo.income = valInfo.income + rewardAmount; // Reseting income of validator

        valInfo.TotalIncome = valInfo.TotalIncome.add(rewardAmount);

        uint256 remainingDelegatorRewardAmount = value.sub(rewardAmount); // Remaining delgators reward amount;
  
        uint256 totalCoinsByDelegators = valInfo.coins.sub(valInfo.amount);
   
        distributeRewardToDelegators(
            remainingDelegatorRewardAmount,
            valAddr,
            totalCoinsByDelegators
        );
    }

    function getValidators() external view returns (address[] memory) {
        return highestValidators;
    }

    /***********************Staking***************************/
    enum Status {
        NotExist,
        Created,
        Staked,
        Unstaked,
        Jailed
    }

    // Validator Struct
    struct Validator {
        address validator;
        Status status;
        uint256 amount; // self amount
        uint256 coins; //  self + delegators
        uint256 income; // self income
        uint256 TotalIncome; // total income
        address[] delegators;
    }

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

    uint256 public totalDXTStake; //  To DXT Stake Amount

    /*************************Punish Params***********************/
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
    uint64 public constant StakingLockPeriod = 151200; // Stake Locking Period(7 days)
    uint64 public constant unjailingPeriod = 2 days;  //2 days
    uint64 public constant RewardClaimingPeriod = 21600;   //24 hrs 21600

    /***************state of the contract******************/
    uint256 public minimumStakeAmount;
    uint256 public MaxValidators;

    /**********Events**********/
   event StakeValidator(address indexed validator, uint256 amount);
    event StakeDelegator(
        address indexed delegator,
        address indexed validator,
        uint256 amount
    );
    event RemoveFromHighestValidators(address indexed validator);
    event RemoveFromCurrentValidatorsList(address indexed validator);
    event UnstakeValidator(address indexed validator);
    event UnstakeDelegator(
        address indexed validator,
        address indexed delegator
    );
    event WithdrawValidatorStaking(
        address indexed validator,
        uint256 indexed amount
    );
    event WithdrawDelegatorStaking(
        address indexed delegator,
        address indexed validator,
        uint256 indexed amount
    );
    event DelegatorClaimReward(
        address indexed delegator,
        address indexed validator,
        uint256 amount
    );
    event ValidatorClaimReward(address indexed validator, uint256 amount);
    event PunishValidator(address indexed validator);
    event RemoveFromPunishValidator(address indexed validator);


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
            highestValidators.length < MaxValidators && !isTopValidator(staker)
        ) {
            highestValidators.push(staker); // push into highestValidator if there is space
        } else if (
            highestValidators.length >= MaxValidators &&
            !isTopValidator(staker) &&
            valInfo.status != Status.Jailed
        ) {
            // Find The Lowest Coins Address & Index in HighestValidators List
            uint256 lowCoin;
            uint256 lowIdx;
            address lowAddress;
            (lowCoin, lowIdx, lowAddress) = lowestCoinsInHighestValidator();

            if (valInfo.coins > lowCoin) {
                highestValidators[lowIdx] = staker;
            }
        }

        // Change the Status to Staked
        if (valInfo.status != Status.Staked) {
            valInfo.status = Status.Staked;
        }
        if (!isActiveValidator(staker)) {
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
        ) = highestCoinsInCurrentValidatorsNotInTopValidator();

        if (
            highestValidators.length < MaxValidators &&
            addValAddress != address(0)
        ) {
            highestValidators.push(addValAddress);
        }

        emit StakeValidator(staker, stakeamount);
        totalDXTStake = totalDXTStake.add(stakeamount);
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
        require(isActiveValidator(validator), "Validator Not Exist");
        require(Status.Jailed != valInfo.status, "Validator Jailed");
        require(valInfo.status != Status.NotExist, "This Validator Not Exist");
        require(valInfo.status != Status.Unstaked, "validator is unstaked");

        if (stakeamount <= 0) {
            return false;
        }

        if (valInfo.status == Status.Staked && stakeInfo.amount == 0) {
            stakeInfo.delegatorAddress = staker; // update in Delegator Staking Struct
            stakeInfo.index = valInfo.delegators.length; // update the index of delegator struct for  delegators array in validator
            //   console.log("Delegator index", stakeInfo.index);
            valInfo.delegators.push(staker);
        }

        valInfo.coins = valInfo.coins.add(stakeamount);
        stakeInfo.amount = stakeInfo.amount.add(stakeamount); // update in Validator Coins(Total)

        if (
            highestValidators.length < MaxValidators &&
            !isTopValidator(validator)
        ) {
            highestValidators.push(validator); // push into highestValidator if there is space
        } else if (
            highestValidators.length >= MaxValidators &&
            !isTopValidator(validator)
        ) {
            // Find The Lowest Coins Address & Index in HighestValidators List
            uint256 lowCoin;
            uint256 lowIdx;
            address lowAddress;
            (lowCoin, lowIdx, lowAddress) = lowestCoinsInHighestValidator();

            if (valInfo.coins > lowCoin) {
                if (!isTopValidator(validator)) {
                    highestValidators[lowIdx] = validator;
                }
            }
        }

        if (valInfo.status != Status.Staked) {
            valInfo.status = Status.Staked;
        }
        //votePower = calcVotePower();
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
        require(valInfo.status != Status.Jailed, "Validator is Jailed");
        require(
            stakingInfo[staker][staker].unstakeblock == 0,
            "Already in Unstaking Status"
        );
        require(unstakeamount > 0, "Don't have any stake");
        require(
            highestValidators.length != 3 && isActiveValidator(staker),
            "Can't Unstake, Validator List Empty"
        );

        stakeInfo.unstakeblock = block.number; // Set Block No When Validator Unstake

        removeFromHighestValidatorList(staker); // Remove From The Highest

        valInfo.status = Status.Unstaked;
        // Get Highest Validator From Current List
        uint256 highCoin;
        uint256 highIdx;
        address addValAddress;

        (
            highCoin,
            highIdx,
            addValAddress
        ) = highestCoinsInCurrentValidatorsNotInTopValidator();

        if (
            highestValidators.length < MaxValidators &&
            addValAddress != address(0)
        ) {
            highestValidators.push(addValAddress);
        }

        //  Update in Struct Proposal

        //votePower = calcVotePower();
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

        emit UnstakeDelegator(
            validator,
            delegator
        );
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

        if (updateBalance >= minimum_Stake_Amount) {
            valInfo.status = Status.Staked; //  Change Status to Staked
        }

        if (updateBalance < minimum_Stake_Amount) {
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
        (lowestCoin, lowIdx, lowValidator) = lowestCoinsInHighestValidator();

        // Find Highest Coins in Current Validator List
        uint256 highCoins;
        uint256 highIndex;
        address highValidator;
        (
            highCoins,
            highIndex,
            highValidator
        ) = highestCoinsInCurrentValidatorsNotInTopValidator();

        if (highCoins > lowestCoin) {
            highestValidators[lowIdx] = highValidator;
        } else if (
            highestValidators.length < MaxValidators &&
            highValidator != address(0) &&
            validatorInfo[highValidator].status != Status.Jailed
        ) {
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
        (lowestCoin, lowIdx, lowValidator) = lowestCoinsInHighestValidator();

        // Find Highest Coins in Current Validator List
        uint256 highCoins;
        uint256 highIndex;
        address highValidator;
        (
            highCoins,
            highIndex,
            highValidator
        ) = highestCoinsInCurrentValidatorsNotInTopValidator();

        if (highCoins > lowestCoin) {
            highestValidators[lowIdx] = highValidator;
        }

        if (valInfo.coins == 0) {
            removeFromCurrentValidatorList(validator);
            valInfo.status = Status.NotExist;
        }

        staker.transfer(amount);
        //votePower = calcVotePower();

        emit WithdrawDelegatorStaking(
            staker,
            validator,
            amount
        );
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

        emit DelegatorClaimReward(
            delegator,
            validator,
            staking
        );
        return true;
    }

    function distributeRewardToDelegators(
        uint256 rewardAmount,
        address validator,
        uint256 totalCoins
    ) private {
        Validator storage valInfo = validatorInfo[validator];

        if (valInfo.delegators.length <= 0) return;

        for (uint256 j = 0; j < valInfo.delegators.length; j++) {
            address curr = valInfo.delegators[j];
            Delegator storage stakeInfo = stakingInfo[curr][validator];

            uint256 stakeamount = stakeInfo.amount;
            uint256 percentageToTransfer = stakeamount.mul(100).div(totalCoins);
            // console.log("Deleg % to transfer", percentageToTransfer);
            uint256 rewardDelegatorAmount = rewardAmount
                .mul(percentageToTransfer)
                .div(100);
            // console.log("Reward Delega Amount", rewardDelegatorAmount);

            stakeInfo.income = stakeInfo.income.add(rewardDelegatorAmount); // Reseting income of delegator
            stakeInfo.totalIncome = stakeInfo.totalIncome.add(
                rewardDelegatorAmount
            );
        }
    }

    /**********************Slashing**********************/

    //  function slash(address validator) public {
    //      punish(validator);
    //  }
    function punish(address validator) external override {  //external override
        //Get The Validator Info to Change Status
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

        // If Cross Punish Threshold Change Status To Jail
        if (punishInfo.missedBlockCounter % felonyThreshold == 0) {
            //  Change the Status to Jailed
            valInfo.status = Status.Jailed;
            //   votePower = totalDXTStake - validatorInfo[validator].coins;

            removeFromHighestValidatorList(validator);

            uint256 highCoin;
            uint256 highIdx;
            address addValAddress;
            (
                highCoin,
                highIdx,
                addValAddress
            ) = highestCoinsInCurrentValidatorsNotInTopValidator();

            if (
                highestValidators.length < MaxValidators &&
                addValAddress != address(0) &&
                validatorInfo[addValAddress].status != Status.Jailed
            ) {
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

        require(block.timestamp >= endTime, "Time not Expired Yet To Unjailed");
        require(msg.value == 1 ether, "1 DXT Needed To UnJailed"); // Need to Submit Only 1 DXT To Unjailed

        // Change Status To Staked
        valInfo.status = Status.Staked;

        if (
            highestValidators.length < MaxValidators && requester != address(0)
        ) {
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
            ) = highestCoinsInCurrentValidatorsNotInTopValidator();

            //Get The Lowest from Highest
            uint256 lowCoin;
            uint256 lowIdx;
            address lowAddress;
            (lowCoin, lowIdx, lowAddress) = lowestCoinsInHighestValidator();

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

    function isActiveValidator(address who) private view returns (bool) {
        for (uint256 k = 0; k < currentValidators.length; k++) {
            if (who == currentValidators[k]) {
                return true;
            }
        }
        return false;
    }

    function isTopValidator(address who) private view returns (bool) {
        for (uint256 i = 0; i < highestValidators.length; i++) {
            if (who == highestValidators[i]) {
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

    function getValidatorInfo(address val)
        public
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

    function removeFromHighestValidatorList(address val) private {
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

    function lowestCoinsInHighestValidator()
        private
        view
        returns (
            uint256,
            uint256,
            address
        )
    {
        uint256 lowestCoin = validatorInfo[highestValidators[0]].coins; //first validator coins
        uint256 lowIndex;
        address lowValidator;

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
        private
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
                !isTopValidator(currentValidators[k]) &&
                validatorInfo[currentValidators[k]].status == Status.Staked &&
                validatorInfo[currentValidators[k]].status != Status.Jailed
            ) {
                highCoins = validatorInfo[currentValidators[k]].coins;
                highIndex = k;
                highestValidatorAddress = currentValidators[k];
            }
        }
        return (highCoins, highIndex, highestValidatorAddress);
    }

    /***** Modifiers Internal Funtions*********/
    function _zeroAddress() internal view {
        require(msg.sender != address(0), "Zero Address");
    }

    function _onlyValidator() internal view {
        require(isActiveValidator(msg.sender), "Validator only");
    }

    /*******Getter*******/
    function getCurrentValidators() public view returns (address[] memory) {
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

    /****************Voting Functionality********************/
    uint256 public votePower;
    uint256 public proposalLastingPeriod;
    mapping(address => bool) public pass;

    struct ProposalInfo {
        // who propose this proposal
        address payable proposer;
        // propose who to be a validator
        address dst;
        // optional detail info of proposal
        string details;
        // time create proposal
        uint256 createTime;
        // propose string
        string variable_name;
        // propose value
        uint256 variable_value;
        //access of voting
        bool access;
        //Vote Power
        uint256 votePowerOfAgree;
        uint256 votePowerOfDisagree;
        // number agree this proposal
        uint16 agree;
        // number reject this proposal
        uint16 reject;
        // is passed
        bool ispassed;
        // means you can get proposal of current vote.
        bool resultExist;
    }

    struct VoteInfo {
        address voter;
        uint256 voteTime;
        bool auth;
    }

    struct activeProposal{
        mapping(address => bool) isEligible;
        mapping(address => uint256) individualCoins;
        uint256 totalVotePower;
    }
    mapping(bytes32 => activeProposal) public activeProposalMap;

    mapping(bytes32 => ProposalInfo) public proposals;
    mapping(address => mapping(bytes32 => VoteInfo)) public votes;
    mapping(address => bytes32[]) public userProposals;

    bytes32[] ProposalsArray;

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
    event LogSetUnpassed(address indexed val, uint256 time);

    function chcekProposal() public view returns (bytes32[] memory) {
        return ProposalsArray;
    } 

    function authchangevalues(bytes32 id) public {
        if (
            keccak256(bytes(proposals[id].variable_name)) ==
            keccak256(bytes("minimumStakeAmount"))
        ) {
            minimumStakeAmount = proposals[id].variable_value;
            address lowValidator;
            for (uint256 i = 0; i < highestValidators.length; i++) {
                (, , lowValidator) = lowestCoinsInHighestValidator();
                if (highestValidators.length <= 2) {
                    break;
                } else if (
                    validatorInfo[lowValidator].coins < minimumStakeAmount
                ) {
                    removeFromHighestValidatorList(lowValidator);
                } else {
                    break;
                }
            }

            if (highestValidators.length < MaxValidators) {
                uint256 validatorToAdd = MaxValidators - highestValidators.length;
                for (uint256 i = 0; i < validatorToAdd; i++) {
                    (
                        ,
                        ,
                        address highestValidatorAddress
                    ) = highestCoinsInCurrentValidatorsNotInTopValidator();
                    if (
                        validatorInfo[highestValidatorAddress].coins >=
                        minimumStakeAmount &&
                        highestValidatorAddress != address(0)
                    )
                     
                    {
                        highestValidators.push(highestValidatorAddress);
                    } else {
                        break;
                    }
                }
            }
        }
        if (
            keccak256(bytes(proposals[id].variable_name)) ==
            keccak256(bytes("MaxValidators"))
        ) {
            // require(proposals[id].variable_value >= 2,"MaxValidators can't be less then 2");

            //removing the validators from highvalidator who donot qualify now
            if (proposals[id].variable_value < MaxValidators) {
                uint256 validatorToRemove = MaxValidators -
                    proposals[id].variable_value;
                for (uint256 i = 0; i < validatorToRemove; i++) {
                    (
                        ,
                        ,
                        address lowValidator
                    ) = lowestCoinsInHighestValidator();
                    removeFromHighestValidatorList(lowValidator);
                }
            }

            MaxValidators = proposals[id].variable_value;
            if (highestValidators.length < MaxValidators) {
                uint256 validatorToAdd = MaxValidators -
                    highestValidators.length;
                for (uint256 i = 0; i < validatorToAdd; i++) {
                    (
                        ,
                        ,
                        address highestValidatorAddress
                    ) = highestCoinsInCurrentValidatorsNotInTopValidator();
                    if (highestValidatorAddress != address(0)) {
                        highestValidators.push(highestValidatorAddress);
                    }
                }
            }
        }
        pass[msg.sender] = false;
        //votePower = calcVotePower();
    }

    function createProposal(
        string calldata details,
        string calldata vari_name,
        uint256 value
    ) external payable onlyValidator returns (bool) {
        //address storage val = msg.sender;
        Validator storage valInfo = validatorInfo[msg.sender];
        require(valInfo.status == Status.Staked,"Only Active Validator"); // Only Active Validator
        address dst = msg.sender;
        //Compare 2 string
        //Validator can only Made these two proposals.onlyValidator
        require(
            keccak256(bytes(vari_name)) == keccak256(bytes("MaxValidators")) ||
                keccak256(bytes(vari_name)) ==
                keccak256(bytes("minimumStakeAmount")),
            "Max Validator & MinimumStakeAmount Proposal Only"
        );
        //Validator Must Pay 1 DXT for creating proposal
        require(msg.value == 1 ether, "Must pay 1 DXT");
        // console.log("Calling now User Proposal");
        bytes32[] memory UserProposal = userProposal();

        //Restrictions for create proposal for minimum stake amount
        if (
            keccak256(bytes(vari_name)) ==
            keccak256(bytes("minimumStakeAmount"))
        ) {
            //Validator can't made proposal for 1 or less than 1 DXT
            require(value >= 1, "minimumStakeAmount can't be less then 1");
            //Checks that validator can only create proposal after 7 days once they creat proposal
            for (uint256 i = 0; i < UserProposal.length; i++) {
                // console.log("AT Line 1270");
                if (
                    keccak256(
                        bytes(proposals[UserProposal[i]].variable_name)
                    ) ==
                    keccak256(bytes("minimumStakeAmount")) &&
                    (block.timestamp <
                        proposals[UserProposal[i]].createTime +
                            proposalLastingPeriod)
                ) {
                    // console.log("Inside If 1280");
                    bool isexist = false;
                    require(isexist == true, "proposal created before");
                }
            }

            value = value * 1 ether; //Convert the value wei into eather
            //Fetch highestAmount of activevalidator
            uint256 highcoin = validatorInfo[highestValidators[0]].coins;
            for (uint256 i = 1; i < highestValidators.length; i++) {
                if (validatorInfo[highestValidators[i]].coins > highcoin) {
                    highcoin = validatorInfo[highestValidators[i]].coins;
                }
            }
            //Validator can't creat proposal that proposal amount > highCoin
            require(value <= highcoin, "set less than highcoin");
        }

        if (keccak256(bytes(vari_name)) == keccak256(bytes("MaxValidators"))) {
            for (uint256 i = 0; i < UserProposal.length; i++) {
                // console.log("At Line 1300");
                if (
                    keccak256(
                        bytes(proposals[UserProposal[i]].variable_name)
                    ) ==
                    keccak256(bytes("MaxValidators")) &&
                    (block.timestamp <
                        proposals[UserProposal[i]].createTime +
                            proposalLastingPeriod)
                ) {
                    // console.log("At Line 1310");
                    bool isexist = false;
                    require(isexist == true, "proposal created before");
                }
            }

            if (value < 3 || value > currentValidators.length || value > 51)
                revert("Invalid Value");
        }
        // generate proposal id
        bytes32 id = keccak256(
            abi.encodePacked(msg.sender, dst, details, block.timestamp)
        );
        bytes32 pID = id;
        bytes32 uID = id;
        //Details can't be more than 100 words
        require(bytes(details).length <= 100, "Details too long");
      
        activeProposal storage activeInfo = activeProposalMap[id];
        uint256 updateCoins = 0;  
        for (uint256 i = 0; i < highestValidators.length; i++) {   
            address currentaddr = highestValidators[i];
            uint256 coins = validatorInfo[currentaddr].coins;
            activeInfo.isEligible[currentaddr] = true; //  Set IsEligible
            activeInfo.individualCoins[currentaddr] = coins; // Update individualCoins Map
            // updTotalCoins = updTotalCoins.add(validatorInfo[currentaddr].coins);
           updateCoins =  updateCoins.add(coins);
        }
        activeInfo.totalVotePower = updateCoins;
        //console.log("Updated Coins:",updateCoins);

        //Set into the mapping
        ProposalInfo memory proposal;
        proposal.proposer = msg.sender;
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
        emit LogCreateProposal(id, msg.sender, dst, block.timestamp);
        return true;
    }
     
    //Will return current values of minimumStakeAmount & MaxValidators
    function currentValue(string memory vari_name)
        public
        view
        returns (uint256)
    {
        if (
            keccak256(bytes(vari_name)) ==
            keccak256(bytes("minimumStakeAmount"))
        ) {
            return (minimumStakeAmount);
        }
        if (keccak256(bytes(vari_name)) == keccak256(bytes("MaxValidators"))) {
            return (MaxValidators);
        }
    }

    //List of proposal validators
    function userProposal() public view returns (bytes32[] memory) {    
        return userProposals[msg.sender];
    }

    //All Current Highest  Validators will vote to that proposal
    function voteProposal(bytes32 id, string calldata vote)
        external
        returns (bool)
    {
        
       bool auth;
        activeProposal storage activeInfo = activeProposalMap[id];
        bool isEligible = activeInfo.isEligible[msg.sender];
        require(isEligible == true,"Not Eligible");// Check Present in Eligible List 
        require(proposals[id].access == true, "Voting completed for this ID");//Check if Proposal is Comleted or Not for this id
        require(proposals[id].createTime != 0, "Proposal not exist"); // Check for Proposal Exist
        require(votes[msg.sender][id].voteTime == 0,"You can't vote for a proposal twice");// Check Can't Vote for Same Proposal Twice
        require(block.timestamp < proposals[id].createTime + proposalLastingPeriod,"Proposal Expired");//Checks Proposal is expired or Not
        //checks spelling of true or false
        if (keccak256(bytes(vote)) == keccak256(bytes("true"))) {
            auth = true;
        } else if ((keccak256(bytes(vote)) == keccak256(bytes("false")))) {
            auth = false;
        } else {
            revert("Invalid Vote");
        }

        //If any validator pass the proposal then his coins will be added in votePower
        uint256 icoin = activeInfo.individualCoins[msg.sender]; // Get Individual Coins 
        if (auth) {
            proposals[id].votePowerOfAgree =
                proposals[id].votePowerOfAgree +
                icoin;
        }else{
           
            proposals[id].votePowerOfDisagree =
                proposals[id].votePowerOfDisagree +
                icoin;
        }

        //Store data into the mapping votes
        votes[msg.sender][id].voteTime = block.timestamp;
        votes[msg.sender][id].voter = msg.sender;
        votes[msg.sender][id].auth = auth;

        emit LogVote(id, msg.sender, auth, block.timestamp);

        // update dst status if proposal is passed
        //counte number of validator agreed and disagree to that proposal
        if (auth) {
            proposals[id].agree += 1;
        } else {
            proposals[id].reject += 1;
        }
        //
        if (pass[proposals[id].dst] || proposals[id].resultExist) {
            // do nothing if dst already passed or rejected.
            return true;
        }

        // Total Coins Proposal ID
        uint256 totalVotePower = activeInfo.totalVotePower;
        
       
        //If voting is agreed by 51% calculating votingPower then update the mapping
        if (proposals[id].votePowerOfAgree >= (totalVotePower / 2) + 1) {
            pass[proposals[id].dst] = true;
            proposals[id].resultExist = true;
            proposals[id].proposer.transfer(1 ether);
    
            authchangevalues(id);
        
            proposals[id].ispassed = true;
            proposals[id].access = false;

            emit LogPassProposal(id, proposals[id].dst, block.timestamp);
            return true;
        }
        //If voting is dis-agreed by 51% calculating votingPower then update the mapping
        if (proposals[id].votePowerOfDisagree >= (totalVotePower / 2) + 1) {
            proposals[id].resultExist = true;
            proposals[id].ispassed = false;
            proposals[id].access = false;
            emit LogRejectProposal(id, proposals[id].dst, block.timestamp);
        }
        return true;
    }


    function getActiveProposal(bytes32 _id) public view returns(bool,uint256,uint256){
        activeProposal storage activeInfo = activeProposalMap[_id];
        uint256 icoins = activeInfo.individualCoins[msg.sender];
        bool isPresent = activeInfo.isEligible[msg.sender];
        uint tvp = activeInfo.totalVotePower;
        return(isPresent,icoins,tvp);
    }

/********************Internal Function**********************/
// function calcVotePower() private view returns(uint256) {
//        uint256 totalCoin;
//        for(uint256 i = 0; i < highestValidators.length; i++) {
//          totalCoin = totalCoin.add(validatorInfo[highestValidators[i]].coins);
//        }
//        return totalCoin;
//     }   
     

}
