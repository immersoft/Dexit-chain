pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;

interface IBSCValidatorSet {

  enum Status{
        NotExist,
        Created,
        Staked,
        Unstaked,
        Jailed
  }

    struct Validator {
        address validator;
        Status status;
        uint256 amount; // self amount
        uint256 coins; //  self + delegators
        uint256 income; // self income
        uint256 TotalIncome; // total income
        address[] delegators;
  }



  function punish(address validator) external;
  //function transferRewardOwner(address payable owner, uint256 reward) external returns(bool);
  function lowestCoinsInHighestValidator() external view returns ( uint256, uint256, address );
  
  function highestCoinsInCurrentValidatorsNotInTopValidator() external view returns (uint256, uint256, address);

  function removeFromHighestValidatorList(address val) external;

  function isTopValidator(address who) external view returns (bool);

  function getValidatorInfo(address val) external view returns ( address, Status, uint256, uint256, uint256, uint256, address[] memory );

  function getCoins(address val) external view returns ( uint256 );

  function getStatus(address val) external view returns ( Status );
  
  function _onlyValidator(address addr) external view;

  function isActiveValidator(address who) external view returns (bool);

  function getMaxValidators() external view returns (uint256);

  function getminimumStakeAmount() external view returns (uint256);

  function getValidators() external  view returns (address[] memory);

  function getCurrentValidators() external view returns (address[] memory);

  function setMaxValidators(uint256) external;

  function setminimumStakeAmount(uint256) external;

}