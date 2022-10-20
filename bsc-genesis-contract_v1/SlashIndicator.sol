// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;
import "./System.sol";
import "./interface/IBSCValidatorSet.sol";

contract SlashIndicator is System {
    uint256 public previousHeight;

    event validatorSlashed(address indexed validator);

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
        alreadyInit = true;
    }

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
}