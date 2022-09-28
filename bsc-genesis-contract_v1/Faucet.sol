// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

contract DexitFaucet {

    mapping(address => uint256) public userRecords;
    
    uint64 public constant PERIOD = 5400; //blocks
    uint256 public constant AMOUNT = 1 ether;
    address public faucetAccount = 0xf292Eb22a427eF3cF0825a1f0E435F278717d4ea;
    //uint256 public claimTime;

    function claimFaucet(address user) payable external{
        require(faucetAccount.balance > 1,"Not enough gas in Faucet account");
        require(address(this).balance > 1,"Not enough balance in Faucet");
        
     
     //require(AMOUNT == 1 ether, "You can only claim one DXT");
     uint256 oldBlockNumber = userRecords[user];
       //uint256 public claimTime;

       if(oldBlockNumber == 0){
        payable(user).transfer(AMOUNT);
        userRecords[user] = block.number; 
        return;  
       }
       else{
           uint256 allowedBlock = oldBlockNumber + PERIOD;
           require(block.number >= allowedBlock, "You can only claim once in 6 hours. Try again later!");
           payable(user).transfer(AMOUNT);
           userRecords[user] = block.number;
           return;
       }
    }
    
    function transferToContract() public payable {}

    function getFaucetOwnerBalance() public view returns (uint256) {
        return faucetAccount.balance;
    }

    function getFaucetContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
