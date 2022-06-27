pragma solidity 0.6.4;

interface IRewardRegister {
  function checkEligible(address[] calldata) external returns(address[] memory);
  function distributeRewardToOwners(uint256) external returns(bool); 
  function transferRewardOwner(address) external returns(uint256);
}