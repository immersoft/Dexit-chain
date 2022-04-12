pragma solidity 0.6.4;

contract DexitFaucet {

    mapping(address => uint256) public userRecords;
    
    uint64 public constant period = 5400; //blocks
    uint256 public constant amount = 1 ether;
    address public FaucetAccount = 0xf292Eb22a427eF3cF0825a1f0E435F278717d4ea;
    //uint256 public claimTime;

    function claimFaucet(address payable user) payable external{
        require(FaucetAccount.balance > 1,"Not enough gas in Faucet account");
        require(address(this).balance > 1,"Not enough balance in Faucet");
        
     
     //require(amount == 1 ether, "You can only claim one DXT");
     uint256 oldBlockNumber = userRecords[user];
       //uint256 public claimTime;

       if(oldBlockNumber == 0){
        user.transfer(amount);
        userRecords[user] = block.number; 
        return;  
       }
       else{
           uint256 allowedBlock = oldBlockNumber + period;
           require(block.number >= allowedBlock, "You can only claim once in 6 hours. Try again later!");
           user.transfer(amount);
           userRecords[user] = block.number;
           return;
       }
    }
    function transferToContract() public payable {

    }
     function getFaucetOwnerBalance() public view returns (uint256) {
        return FaucetAccount.balance;
    }
    function getFaucetContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
