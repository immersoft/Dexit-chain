pragma solidity 0.6.4;
import "./System.sol";
import "./lib/BytesToTypes.sol";
import "./lib/Memory.sol";
import "./interface/ISlashIndicator.sol";
import "./interface/IApplication.sol";
import "./interface/IBSCValidatorSet.sol";
import "./interface/IParamSubscriber.sol";
import "./interface/ICrossChain.sol";
import "./lib/CmnPkg.sol";
import "./lib/RLPEncode.sol";
import "./lib/SafeMath.sol";

// Removed The IApplication
contract SlashIndicator is ISlashIndicator, System, IParamSubscriber {
    using RLPEncode for *;
    using SafeMath for uint256;

    uint256 public constant MISDEMEANOR_THRESHOLD = 50;
    uint256 public constant FELONY_THRESHOLD = 150;
    uint256 public constant BSC_RELAYER_REWARD = 1e16;
    uint256 public constant DECREASE_RATE = 4;

    // State of the contract
    address[] public validators;
    mapping(address => Indicator) public indicators;
    uint256 public previousHeight;
    uint256 public misdemeanorThreshold;
    uint256 public felonyThreshold;

    event validatorSlashed(address indexed validator);
    event indicatorCleaned();
    event paramChange(string key, bytes value);

    event knownResponse(uint32 code);
    event unKnownResponse(uint32 code);
    event crashResponse();

    struct Indicator {
        uint256 height;
        uint256 count;
        bool exist;
    }

    modifier oncePerBlock() {
        require(
            block.number > previousHeight,
            "can not slash twice in one block"
        );
        _;
        previousHeight = block.number;
    }

    modifier onlyZeroGasPrice() {
        require(tx.gasprice == 0, "gasprice is not zero");

        _;
    }

    function init() external onlyNotInit {
        misdemeanorThreshold = MISDEMEANOR_THRESHOLD;
        felonyThreshold = FELONY_THRESHOLD;
        alreadyInit = true;
    }

    /*********************** Implement cross chain app ********************************/

    /*********************** External func ********************************/
    function slash(address validator)
        external
        onlyCoinbase
        onlyInit
        oncePerBlock
        onlyZeroGasPrice
    {
        IBSCValidatorSet(VALIDATOR_CONTRACT_ADDR).punish(validator);
        emit validatorSlashed(validator);
    }

    // To prevent validator misbehaving and leaving, do not clean slash record to zero, but decrease by felonyThreshold/DECREASE_RATE .
    // Clean is an effective implement to reorganize "validators" and "indicators".
    function clean()
        external
        override(ISlashIndicator)
        onlyValidatorContract
        onlyInit
    {
        if (validators.length == 0) {
            return;
        }
        uint256 i = 0;
        uint256 j = validators.length - 1;
        for (; i <= j; ) {
            bool findLeft = false;
            bool findRight = false;
            for (; i < j; i++) {
                Indicator memory leftIndicator = indicators[validators[i]];
                if (leftIndicator.count > felonyThreshold / DECREASE_RATE) {
                    leftIndicator.count =
                        leftIndicator.count -
                        felonyThreshold /
                        DECREASE_RATE;
                    indicators[validators[i]] = leftIndicator;
                } else {
                    findLeft = true;
                    break;
                }
            }
            for (; i <= j; j--) {
                Indicator memory rightIndicator = indicators[validators[j]];
                if (rightIndicator.count > felonyThreshold / DECREASE_RATE) {
                    rightIndicator.count =
                        rightIndicator.count -
                        felonyThreshold /
                        DECREASE_RATE;
                    indicators[validators[j]] = rightIndicator;
                    findRight = true;
                    break;
                } else {
                    delete indicators[validators[j]];
                    validators.pop();
                }
                // avoid underflow
                if (j == 0) {
                    break;
                }
            }
            // swap element in array
            if (findLeft && findRight) {
                delete indicators[validators[i]];
                validators[i] = validators[j];
                validators.pop();
            }
            // avoid underflow
            if (j == 0) {
                break;
            }
            // move to next
            i++;
            j--;
        }
        emit indicatorCleaned();
    }

    /*********************** Param update ********************************/
    function updateParam(string calldata key, bytes calldata value)
        external
        override
        onlyInit
        onlyGov
    {
        if (Memory.compareStrings(key, "misdemeanorThreshold")) {
            require(
                value.length == 32,
                "length of misdemeanorThreshold mismatch"
            );
            uint256 newMisdemeanorThreshold = BytesToTypes.bytesToUint256(
                32,
                value
            );
            require(
                newMisdemeanorThreshold >= 1 &&
                    newMisdemeanorThreshold < felonyThreshold,
                "the misdemeanorThreshold out of range"
            );
            misdemeanorThreshold = newMisdemeanorThreshold;
        } else if (Memory.compareStrings(key, "felonyThreshold")) {
            require(value.length == 32, "length of felonyThreshold mismatch");
            uint256 newFelonyThreshold = BytesToTypes.bytesToUint256(32, value);
            require(
                newFelonyThreshold <= 1000 &&
                    newFelonyThreshold > misdemeanorThreshold,
                "the felonyThreshold out of range"
            );
            felonyThreshold = newFelonyThreshold;
        } else {
            require(false, "unknown param");
        }
        emit paramChange(key, value);
    }

    /*********************** query api ********************************/
    function getSlashIndicator(address validator)
        external
        view
        returns (uint256, uint256)
    {
        Indicator memory indicator = indicators[validator];
        return (indicator.height, indicator.count);
    }

    function encodeSlashPackage(address valAddr)
        internal
        view
        returns (bytes memory)
    {
        bytes[] memory elements = new bytes[](4);
        elements[0] = valAddr.encodeAddress();
        elements[1] = uint256(block.number).encodeUint();
        elements[2] = uint256(bscChainID).encodeUint();
        elements[3] = uint256(block.timestamp).encodeUint();
        return elements.encodeList();
    }
}