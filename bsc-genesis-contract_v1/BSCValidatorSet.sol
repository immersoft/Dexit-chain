// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./System.sol";
import "./interface/IBSCValidatorSet.sol";
import "./interface/IRewardRegister.sol";
import "./ReentrancyGuard.sol";

contract BSCValidatorSet is IBSCValidatorSet, System, ReentrancyGuard {
    uint8 public constant MISDEMEANOR_THRESHOLD = 50; //50
    uint8 public constant FELONY_THRESHOLD = 150; //150
    uint256 public misdemeanorThreshold;
    uint256 public felonyThreshold;

    uint256 public constant BURN_RATIO_SCALE = 100;
    address public constant BURN_ADDRESS =
        0x000000000000000000000000000000000000dEaD;
    uint256 public constant INIT_BURN_RATIO = 1;
    uint256 public burnRatio;
    bool public burnRatioInitialized;

    //Delegator Struct
    struct Delegator {
        address delegatorAddress; //  delegator self address
        uint256 amount; // self stake
        uint256 unstakeBlock; // unstakeBlock = 0 means can stake if !=0 already unstake
        uint256 index; // index no represent in stakers array in Validator Struct
        uint256 income; // delegator income
        uint256 totalIncome;
    }

    // Validator Address  = > Get Validator Information
    mapping(address => Validator) validatorInfo;
    // Delegator Address => Validator Address =>Staking Info
    mapping(address => mapping(address => Delegator)) stakingInfo;
    //Claim time record for validator and delegator
    mapping(address => uint256) public rewardClaimRecordsValidator;
    mapping(address => uint256) public rewardClaimRecordsDelegator;

    address[] public currentValidators; // All Validators
    address[] public highestValidators; // Only Active Validators
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
    uint256 public constant MINIMUM_STAKE_AMOUNT = 10000 ether; // Minimum Stake DXT
    uint256 public constant MAXIMUM_VALIDATORS = 5; // Initial Max Validators
    uint64 public constant STAKING_LOCK_PERIOD = 201600; // Stake Locking Period(7 days) //201600 blocks //2400 blocks 2 hours
    uint64 public constant UNJAILING_PERIOD = 8 hours; //2 days
    uint64 public constant REWARD_CLAIMING_PERIOD = 28800; //24 hrs 28800 //1200 blocks one hour

    uint256 public minimumStakeAmount;
    uint256 public maxValidators;
    uint256 public preMaxValidators;

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
    event OwnerClaimReward(address indexed owner, uint256 amount);
    event PunishValidator(address indexed validator);
    event RemoveFromPunishValidator(address indexed validator);

    /*********************** modifiers **************************/
    modifier noEmptyDeposit() {
        require(msg.value > 0, "deposit value is zero");
        _;
    }
    modifier notZeroAddress() {
        nonZeroAddress();
        _;
    }
    modifier onlyValidator() {
        address addr = msg.sender;
        this.onlyValidatorCheck(addr);
        _;
    }

    function nonZeroAddress() internal view {
        require(msg.sender != address(0), "Zero Address");
    }

    function onlyValidatorCheck(address addr) external view override {
        require(this.isActiveValidator(addr), "Validator only");
    }

    /*********************** init **************************/
    function init() external onlyNotInit {
        burnRatio = INIT_BURN_RATIO;
        burnRatioInitialized = true;
        minimumStakeAmount = MINIMUM_STAKE_AMOUNT;
        maxValidators = MAXIMUM_VALIDATORS;
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
        notZeroAddress
        noEmptyDeposit
        nonReentrant
    {
        Validator storage valInfo = validatorInfo[valAddr];
        require(valAddr != address(0), "Zero address");
        uint256 value = msg.value;
        uint256 curBurnRatio;
        uint256 UpdatedCoins = valInfo.coins;
        curBurnRatio = burnRatio;

        if (value > 0) {
            uint256 toBurn = (value * curBurnRatio) / BURN_RATIO_SCALE;
            if (toBurn > 0) {
                payable(BURN_ADDRESS).transfer(toBurn);
                value = value - toBurn;
            }
        }

        if (valInfo.validator == address(0x0)) {
            return;
        }
        
        if (
            (
                IRewardRegister(CROSS_CHAIN_CONTRACT_ADDR).checkEligible(
                    _contractArray
                )
            ).length > 0
        ) {
            uint256 rewardOwners = (value * (45)) / (99);
            if (
                (
                    IRewardRegister(CROSS_CHAIN_CONTRACT_ADDR)
                        .distributeRewardToOwners(rewardOwners)
                )
            ) value = value - rewardOwners;
        }

        require(valInfo.status != IBSCValidatorSet.Status.Jailed); // Check for Not Exist Or Jailed
        require(valInfo.status != IBSCValidatorSet.Status.Unstaked);
        delete elegibleDel;
        for (uint256 j = 0; j < valInfo.delegators.length; j++) {
            address curr = valInfo.delegators[j];
            Delegator storage stakeInfo = stakingInfo[curr][valAddr];
            uint256 delAmt = stakeInfo.amount;
            if (stakeInfo.unstakeBlock == 0) {
                elegibleDel.push(curr);
            } else {
                UpdatedCoins = UpdatedCoins - delAmt;
            }
        }

        uint256 percentageToTransfer = (valInfo.amount * 10000000000) / UpdatedCoins;
        uint256 rewardAmount = (value * percentageToTransfer) / 10000000000;
        valInfo.income = valInfo.income + rewardAmount; // Updating income of validator
        valInfo.totalIncome = valInfo.totalIncome + rewardAmount;
        uint256 remainingDelegatorRewardAmount = value - rewardAmount; // Remaining delgators reward amount;
        uint256 totalCoinsByDelegators = UpdatedCoins - valInfo.amount;
        distributeRewardToDelegators(
            remainingDelegatorRewardAmount,
            valAddr,
            totalCoinsByDelegators
        );
    }

    /***********************Staking***************************/
    function stakeValidator() external payable notZeroAddress returns (bool) {
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
                "Stake more than minimum stake amount"
            );
            valInfo.validator = staker;
            valInfo.amount = valInfo.amount + stakeamount;
            valInfo.coins = valInfo.coins + stakeamount;
        } else if (
            valInfo.amount > 0 &&
            (Status.Staked == valInfo.status ||
                Status.Unstaked == valInfo.status)
        ) {
            require(stakeamount >= 100, "Stake atleast 100 DXT");
            valInfo.amount = valInfo.amount + stakeamount;
            valInfo.coins = valInfo.coins + stakeamount;
            stakeInfo.unstakeBlock = 0; // Update The Block No
            //Testing purpose
            require(valInfo.amount >= minimumStakeAmount, "Insufficient staking by Validator");
        }

        if (
            highestValidators.length < maxValidators &&
            !this.isTopValidator(staker)
        ) {
            highestValidators.push(staker); // push into highestValidator if there is space
        } else if (
            highestValidators.length >= maxValidators &&
            !this.isTopValidator(staker) &&
            valInfo.status != IBSCValidatorSet.Status.Jailed
        ) {
            // Find The Lowest Coins Address & Index in HighestValidators List
            uint256 lowCoin;
            uint256 lowIdx;
            address lowAddress;
            (lowCoin, lowIdx, lowAddress) = this
                .lowestCoinsInHighestValidator();

            if (valInfo.coins > lowCoin) {
                highestValidators[lowIdx] = staker;
            }
        }

        // Change the Status to Staked
        if (valInfo.status != IBSCValidatorSet.Status.Staked) {
            valInfo.status = IBSCValidatorSet.Status.Staked;
        }

        if (!this.isActiveValidator(staker)) {
            currentValidators.push(staker);
        }

        //Get highestValidator from currentValidator and push it into highestValidator list (for staking more than 1 time)
        uint256 highCoin;
        uint256 highIdx;
        address addValAddress;
        (highCoin, highIdx, addValAddress) = this
            .highestCoinsInCurrentValidatorsNotInTopValidator();

        if (
            highestValidators.length < maxValidators &&
            addValAddress != address(0) &&
            highCoin >= minimumStakeAmount
        ) {
            highestValidators.push(addValAddress);
        }

        totalDXTStake = totalDXTStake + stakeamount;
        emit StakeValidator(staker, stakeamount);
        return true;
    }

    //Function to Stake Delegators
    function stakeDelegator(address validator)
        external
        payable
        notZeroAddress
        returns (bool)
    {
        address staker = msg.sender; //Delegator Address
        uint256 stakeamount = msg.value; // Stake Amount

        // Struct Validator & Delegator
        Validator storage valInfo = validatorInfo[validator];
        Delegator storage stakeInfo = stakingInfo[staker][validator];

        require(validator != msg.sender, "Validator can not delegate");
        require(stakeamount > 0, "Can't stake 0 DXT");
        require(this.isActiveValidator(validator), "Validator Not Exist");
        require(Status.Staked == valInfo.status, "Validator Not Staked");
        //Testing purpose
        require(valInfo.amount >= minimumStakeAmount, "Insufficient staking by Validator");

        if (stakeInfo.amount == 0) {
            stakeInfo.delegatorAddress = staker; // update in Delegator Staking Struct
            stakeInfo.index = valInfo.delegators.length; // update the index of delegator struct for  delegators array in validator
            valInfo.delegators.push(staker);
        }

        if (stakeInfo.amount > 0) {
            stakeInfo.unstakeBlock = 0;
        }

        valInfo.coins = valInfo.coins + stakeamount;
        stakeInfo.amount = stakeInfo.amount + stakeamount; // update in Validator Coins(Total)
        
        if (
            highestValidators.length < maxValidators &&
            !this.isTopValidator(validator)
        ) {
            //console.log("this is push 337 : ",maxValidators, minimumStakeAmount);
            highestValidators.push(validator); // push into highestValidator if there is space
        } else if (
            highestValidators.length >= maxValidators &&
            !this.isTopValidator(validator)
        ) {
            // Find The Lowest Coins Address & Index in HighestValidators List
            uint256 lowCoin;
            uint256 lowIdx;
            address lowAddress;
            (lowCoin, lowIdx, lowAddress) = this
                .lowestCoinsInHighestValidator();

            if (valInfo.coins > lowCoin) {
                highestValidators[lowIdx] = validator;
            }
        }

        totalDXTStake = totalDXTStake + stakeamount;
        emit StakeDelegator(staker, validator, stakeamount);
        return true;
    }

    //Function to UnStakeValidator
    function unstakeValidator() external notZeroAddress returns (bool) {
        address staker = msg.sender; //get the validator address

        //Struct Validator & Delegator
        Validator storage valInfo = validatorInfo[staker];
        Delegator storage stakeInfo = stakingInfo[staker][staker];
        uint256 unstakeamount = valInfo.amount; // self amount validator

        // Check for the unstakeBlock status
        require(valInfo.status == Status.Staked, "Validator Should Staked");
        require(
            stakingInfo[staker][staker].unstakeBlock == 0,
            "Already in Unstaking Status"
        );
        require(unstakeamount > 0, "Don't have any stake");
        require(
            highestValidators.length > 3 && this.isActiveValidator(staker),
            "Can't Unstake, Validators list underflow"
        );

        stakeInfo.unstakeBlock = block.number; // Set Block No When Validator Unstake
        removeFromHighestValidatorList(staker); // Remove From The Highest
        valInfo.status = Status.Unstaked;
        // Get Highest Validator From Current List
        uint256 highCoin;
        uint256 highIdx;
        address addValAddress;
        (highCoin, highIdx, addValAddress) = this
            .highestCoinsInCurrentValidatorsNotInTopValidator();
        if (
            highestValidators.length < maxValidators &&
            addValAddress != address(0)
        ) {
            highestValidators.push(addValAddress);
        }

        emit UnstakeValidator(staker);
        return true;
    }

    // //Function to UnStakeDelegator
    function unstakeDelegators(address validator)
        external
        notZeroAddress
        returns (bool)
    {
        address delegator = msg.sender; //get Delegator Address

        Delegator storage stakeInfo = stakingInfo[delegator][validator]; // Struct Delegator
        uint256 unstakeamount = stakeInfo.amount; // get the staking info

        require(stakeInfo.unstakeBlock == 0, "Already in unstaking status");
        require(unstakeamount > 0, "don't have any stake");

        stakeInfo.unstakeBlock = block.number; // Update The Unstake Block for Deligator
        emit UnstakeDelegator(validator, delegator);
        return true;
    }

    //Function to WithdrawValidator staking after unstakeValidator
    function withdrawValidatorStaking(uint256 amount)
        external
        notZeroAddress
        nonReentrant
        returns (bool)
    {
        address staker = msg.sender; // validator address
        Validator storage valInfo = validatorInfo[staker];
        Delegator storage stakeInfo = stakingInfo[staker][staker];

        require(
            amount <= valInfo.amount,
            "Can't Withdraw More Than Stake Amount"
        ); // Can't Unstake More Than Stake Amount
        require(stakeInfo.unstakeBlock != 0, "Unstake First");
        require(
            stakeInfo.unstakeBlock + STAKING_LOCK_PERIOD <= block.number,
            "Staking haven't unlocked yet"
        );

        uint256 updateBalance = valInfo.amount - amount; // balance - amount

        valInfo.amount = valInfo.amount - amount; // update the amount
        valInfo.coins = valInfo.coins - amount; // Update Coins
        if (updateBalance >= minimumStakeAmount) {
            valInfo.status = Status.Staked; //  Change Status to Staked
        }

        if (updateBalance < minimumStakeAmount) {
            if (updateBalance == 0 && valInfo.income == 0) {
                valInfo.status = Status.NotExist;
            } else {
                revert("Claim collected rewards and withdraw all at once");
            }
        }

        if (valInfo.amount == 0 && valInfo.coins == 0 && valInfo.income == 0) {
            valInfo.status = Status.NotExist;
            removeFromCurrentValidatorList(staker);
        }

        stakeInfo.unstakeBlock = 0; // Reset The unstakeBlock
        payable(staker).transfer(amount); // Transfer the amount to validator
        // Find Lowest in Highest Validator
        uint256 lowestCoin;
        uint256 lowIdx;
        address lowValidator;
        (lowestCoin, lowIdx, lowValidator) = this
            .lowestCoinsInHighestValidator();
        // Find Highest Coins in Current Validator List
        uint256 highCoins;
        uint256 highIndex;
        address highValidator;
        (highCoins, highIndex, highValidator) = this
            .highestCoinsInCurrentValidatorsNotInTopValidator();
        if (highCoins > lowestCoin && highestValidators.length >= maxValidators && highValidator != address(0)) {
            highestValidators[lowIdx] = highValidator;
        } else if (
            highestValidators.length < maxValidators &&
            highValidator != address(0) &&
            validatorInfo[highValidator].status != Status.Jailed
        ) {
            //console.log("this is push 502 : ",maxValidators, minimumStakeAmount);
            highestValidators.push(highValidator);
        }

        emit WithdrawValidatorStaking(staker, amount);
        totalDXTStake = totalDXTStake - amount;
        return true;
    }

    //Function to withdraw Delegator Staking
    function withdrawDelegatorStaking(address validator, uint256 amount)
        external
        notZeroAddress
        nonReentrant
        returns (bool)
    {
        address staker = msg.sender; //Delegator Address

        Delegator storage stakeInfo = stakingInfo[staker][validator]; // Delegator Staking Info
        Validator storage valInfo = validatorInfo[validator]; // Validator

        require(
            amount <= stakeInfo.amount,
            "Can't Withdraw More Than Stake Amount"
        ); // Can not withdraw more than stake
        require(stakeInfo.unstakeBlock != 0, "Unstake First");
        require(
            stakeInfo.unstakeBlock + STAKING_LOCK_PERIOD <= block.number,
            "Staking haven't unlocked yet"
        );

        stakeInfo.amount = stakeInfo.amount - amount;
        valInfo.coins = valInfo.coins - amount; // Update The Coins in Validator Record
        stakeInfo.unstakeBlock = 0;

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
        (lowestCoin, lowIdx, lowValidator) = this
            .lowestCoinsInHighestValidator();
        // Find Highest Coins in Current Validator List
        uint256 highCoins;
        uint256 highIndex;
        address highValidator;
        (highCoins, highIndex, highValidator) = this
            .highestCoinsInCurrentValidatorsNotInTopValidator();

        if (highCoins > lowestCoin && highValidator != address(0)) {
            highestValidators[lowIdx] = highValidator;
        }

        if (valInfo.coins == 0) {
            removeFromCurrentValidatorList(validator);
            valInfo.status = Status.NotExist;
        }

        payable(staker).transfer(amount);
        totalDXTStake = totalDXTStake - amount;
        emit WithdrawDelegatorStaking(staker, validator, amount);
        return true;
    }

    //Function to Validator Can Claim Reward
    function claimValidatorReward()
        external
        notZeroAddress
        nonReentrant
        returns (bool)
    {
        address staker = msg.sender; // validator address
        Validator storage valInfo = validatorInfo[staker];
        uint256 oldClaimTime = rewardClaimRecordsValidator[staker];

        require(
            valInfo.status != Status.NotExist && valInfo.status != Status.Jailed
        ); // Check for Not Exist Or Jailed
        require(valInfo.income > 0, "No incomes yet.");

        uint256 rewardAmount = valInfo.income;
        if (oldClaimTime == 0) {
            rewardClaimRecordsValidator[staker] = block.number;
            payable(staker).transfer(rewardAmount); // Transfering The Reward Amount
            valInfo.income = 0; // Reseting income of validator
        } else {
            uint256 endTime = oldClaimTime + REWARD_CLAIMING_PERIOD;
            require(block.number >= endTime, "Claim after 24 hours");
            payable(staker).transfer(rewardAmount);
            rewardClaimRecordsValidator[staker] = block.number;
            valInfo.income = 0; // Reseting income of validator
        }
        if(valInfo.amount == 0 && valInfo.coins == 0 && valInfo.income == 0){
                valInfo.status == Status.NotExist;
                removeFromCurrentValidatorList(staker);
            }

        emit ValidatorClaimReward(staker, rewardAmount);
        return true;
    }

    //Function to Delegator Can Claim Reward
    function claimDelegatorReward(address validator)
        external
        notZeroAddress
        nonReentrant
        returns (bool)
    {
        address delegator = msg.sender; // delegator self address
        Delegator storage stakeInfo = stakingInfo[delegator][validator]; // Get Delegators Info
        uint256 oldClaimTime = rewardClaimRecordsDelegator[delegator];
        require(stakeInfo.income > 0, "No incomes yet.");
        uint256 staking = stakeInfo.income;

        if (oldClaimTime == 0) {
            rewardClaimRecordsDelegator[delegator] = block.number;
            payable(delegator).transfer(staking); // transfer the income to delegators
            stakeInfo.income = 0;
        } else {
            uint256 endTime = oldClaimTime + REWARD_CLAIMING_PERIOD;
            require(block.number >= endTime, "Claim after 24 hours");
            payable(delegator).transfer(staking);
            rewardClaimRecordsDelegator[delegator] = block.number;
            stakeInfo.income = 0;
        }

        emit DelegatorClaimReward(delegator, validator, staking);
        return true;
    }

    function claimOwnerReward()
        external
        notZeroAddress
        nonReentrant
        returns (bool) {
        address owner = msg.sender;
        uint256 reward = IRewardRegister(CROSS_CHAIN_CONTRACT_ADDR)
            .transferRewardOwner(owner);
        payable(owner).transfer(reward);
        emit OwnerClaimReward(owner, reward);
        return true;
    }

    /*********************Getting call from blockchain*********************/
    function pushContractOwner(address contAddr, address owner)
        external
        onlyCoinbase
        returns (bool) {
        IRewardRegister(CROSS_CHAIN_CONTRACT_ADDR).pushContractRecord(
            contAddr,
            owner
        );
        return true;
    }

    /**********************Slashing**********************/
    function punish(address validator) external override onlySlash {
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
        punishInfo.missedBlockCounter = punishInfo.missedBlockCounter + 1;
        
        if (punishInfo.missedBlockCounter % felonyThreshold == 0) {
            //  Change the Status to Jailed
            
            removeFromHighestValidatorList(validator);
            valInfo.status = Status.Jailed;
            uint256 highCoin;
            uint256 highIdx;
            address addValAddress;
            (highCoin, highIdx, addValAddress) = this
                .highestCoinsInCurrentValidatorsNotInTopValidator();
            
            if (
                highestValidators.length < maxValidators &&
                addValAddress != address(0)
            ) {
                highestValidators.push(addValAddress);
            }

            uint256 rest = highestValidators.length;
            uint256 averageDistribute = income / rest;
            distributeRewardIncomeExcept(averageDistribute);
            valInfo.income = 0;
            punishInfo.missedBlockCounter = 0;
            punishInfo.jailedTime = block.timestamp;
        } else if (
            punishInfo.missedBlockCounter % misdemeanorThreshold == 0 &&
            Status.Jailed != valInfo.status
        ) {
            uint256 rest = highestValidators.length - 1;
            uint256 averageDistribute = income / rest;
            // Logic to Distribute Income to Better Validators
            distributeRewardIncomeExcept(averageDistribute);
            // Reset the Validator Missed Block Counter
            valInfo.income = 0;
        }

        emit PunishValidator(validator);
    }

    //Function to Unjailed the validator
    function unJailed() external payable {
        address requester = msg.sender; // validator address
        Validator storage valInfo = validatorInfo[requester];
        PunishRecord storage punishInfo = punishRecord[requester]; // Get The Punish Record
        uint256 endTime = punishInfo.jailedTime + UNJAILING_PERIOD; // Get The End Time
        require(valInfo.status == Status.Jailed, "Not in Jail");
        require(block.timestamp >= endTime, "WaitToUnjail");
        require(msg.value == 2000 ether, "Pay 2000 DXT"); // Need to Submit Only 1 DXT To Unjailed
        // Change Status To Staked
        valInfo.status = Status.Staked;
        
        if (
            highestValidators.length < maxValidators && requester != address(0)
        ) {
            //console.log("this is push 766 : ",maxValidators, minimumStakeAmount);
            if(valInfo.amount >= minimumStakeAmount){
                highestValidators.push(requester);
            }
        } else {
            // Get The Highest from Current
            uint256 highCoin;
            uint256 highIdx;
            address addValAddress;
            (highCoin, highIdx, addValAddress) = this
                .highestCoinsInCurrentValidatorsNotInTopValidator();
            //Get The Lowest from Highest
            uint256 lowCoin;
            uint256 lowIdx;
            address lowAddress;
            (lowCoin, lowIdx, lowAddress) = this
                .lowestCoinsInHighestValidator();
            if (highCoin > lowCoin && addValAddress != address(0)) {
                highestValidators[lowIdx] = addValAddress;
            }
        }

        // Reset Punish Record
        punishInfo.jailedTime = 0;
        punishInfo.index = 0;
        punishInfo.isPunished = false;
        removeFromPunishValidator(requester); // Remove From Punish Record
    }

    /********************Internal Functions******************/

    function isActiveValidator(address who)
        external
        view
        override
        returns (bool) {
        for (uint256 k = 0; k < currentValidators.length; k++) {
            if (who == currentValidators[k]) {
                return true;
            }
        }
        return false;
    }

    function lowestCoinsInHighestValidator()
        external
        view
        override
        onlyValidatorContract
        returns (
            uint256,
            uint256,
            address
        ) {
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
        external
        view
        override
        onlyValidatorContract
        returns (
            uint256,
            uint256,
            address
        ) {
        uint256 highCoins;
        uint256 highIndex;
        address highestValidatorAddress;

        for (uint256 k = 0; k < currentValidators.length; k++) {
            if (
                validatorInfo[currentValidators[k]].coins > highCoins &&
                !this.isTopValidator(currentValidators[k]) &&
                validatorInfo[currentValidators[k]].status == Status.Staked &&
                //Testing purpose   
                validatorInfo[currentValidators[k]].amount >= minimumStakeAmount
            ) {
                highCoins = validatorInfo[currentValidators[k]].coins;
                highIndex = k;
                highestValidatorAddress = currentValidators[k];
            }
        }

        return (highCoins, highIndex, highestValidatorAddress);
    }

    function isTopValidator(address who)
        external
        view
        override
        onlyValidatorContract
        returns (bool) {
        
        for (uint256 i = 0; i < highestValidators.length; i++) {
            if (who == highestValidators[i]) {
                return true;
            }
        }

        return false;
    }

    /**************getter methods*******************************/
    function getMinimumStakeAmount() external view override returns (uint256) {
        return minimumStakeAmount;
    }

    function getMaxValidators() external view override returns (uint256) {
        return maxValidators;
    }

    function getValidators() external view override returns (address[] memory) {
        return highestValidators;
    }

    function getValidatorInfo(address val)
        external
        view
        override
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
            v.totalIncome,
            v.delegators
        );
    }

    function getStakingInfo(address staker, address val)
        external
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
            stakingInfo[staker][val].unstakeBlock,
            stakingInfo[staker][val].index,
            stakingInfo[staker][val].income,
            stakingInfo[staker][val].totalIncome
        );
    }

    function getCurrentValidators()
        external
        view
        override
        returns (address[] memory)
    {
        return currentValidators;
    }

    function getPunishValidators() external view returns (address[] memory) {
        return punishValidator;
    }

    function getPunishInfo(address validator)
        external
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

    function getBlockNumber() external view returns (uint256) {
        return block.number;
    }

    function getHighestValidators() external view returns (address[] memory) {
        return highestValidators;
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function updateVotingValues(
        string calldata variable_name,
        uint256 variable_value
    ) external override onlyGov {
        // require(resultExist == false,"proposal Expired");
        if (
            keccak256(bytes(variable_name)) ==
            keccak256(bytes("minimumStakeAmount"))
        ) {
            minimumStakeAmount = variable_value;
            address lowValidator;
            while (true) {
                (, , lowValidator) = this.lowestCoinsInHighestValidator();
                uint256 coins = this.getCoins(lowValidator);
                if (highestValidators.length <= 3) {
                    break;
                } else if (coins < minimumStakeAmount) {
                    removeFromHighestValidatorList(lowValidator);
                } else {
                    break;
                }
            }
            if (highestValidators.length < maxValidators) {
                uint256 validatorToAdd = maxValidators -
                    highestValidators.length;

                for (uint256 i = 0; i < validatorToAdd; i++) {
                    (, , address highestValidatorAddress) = this
                        .highestCoinsInCurrentValidatorsNotInTopValidator();
                    uint256 coins = this.getCoins(highestValidatorAddress);
                    if (
                        coins >= minimumStakeAmount &&
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
            keccak256(bytes(variable_name)) == keccak256(bytes("maxValidators"))
        ) {
            preMaxValidators = maxValidators;
            //removing the validators from highvalidator who donot qualify now
            if (variable_value < preMaxValidators) {
                uint256 validatorToRemove = maxValidators - variable_value;
                for (uint256 i = 0; i < validatorToRemove; i++) {
                    (, , address lowValidator) = this
                        .lowestCoinsInHighestValidator();
                    removeFromHighestValidatorList(lowValidator);
                }
            }
            maxValidators = variable_value;
            if (highestValidators.length < maxValidators) {
                uint256 validatorToAdd = maxValidators -
                    highestValidators.length;
                for (uint256 i = 0; i < validatorToAdd; i++) {
                    (, , address highestValidatorAddress) = this
                        .highestCoinsInCurrentValidatorsNotInTopValidator();
                    if (highestValidatorAddress != address(0)) {
                        highestValidators.push(highestValidatorAddress);
                    }
                }
            }
        }
    }

    function getStatus(address val)
        external
        view
        override
        onlyGov
        returns (Status)
    {
        Validator memory v = validatorInfo[val];
        return (v.status);
    }

    function getCoins(address val) external view override returns (uint256) {
        Validator memory v = validatorInfo[val];
        return (v.coins);
    }

    function removeFromHighestValidatorList(address val) internal {
        uint256 n = highestValidators.length;
        if(n <= 3){
            return;
        }
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
            uint256 percentageToTransfer = (stakeamount * 10000000000) /
                totalCoins;
            uint256 rewardDelegatorAmount = (rewardAmount *
                percentageToTransfer) / 10000000000;
            stakeInfo.income = stakeInfo.income + rewardDelegatorAmount; // Reseting income of delegator
            stakeInfo.totalIncome =
                stakeInfo.totalIncome +
                rewardDelegatorAmount;
        }
    }

    //Function to distribute reward income
    function distributeRewardIncomeExcept(uint256 averageDistribute) private {
        if (averageDistribute != 0) {
            for (uint256 i = 0; i < highestValidators.length; i++) {
                validatorInfo[highestValidators[i]].income =
                    validatorInfo[highestValidators[i]].income +
                    averageDistribute;
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
}
