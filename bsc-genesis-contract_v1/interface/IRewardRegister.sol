// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;
interface IRewardRegister {
  function checkEligible(address[] calldata) external returns(address[] memory);
  function distributeRewardToOwners(uint256) external returns(bool); 
  function transferRewardOwner(address) external returns(uint256);
  function pushContractRecord(address, address) external returns(bool);
}