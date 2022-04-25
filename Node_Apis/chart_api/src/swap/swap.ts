import { SwapTable } from "./swapHistory.entity";
const express = require("express");
const app = express();
const cors = require("cors");
const Web3 = require("web3");
const Swap_ABI = require("./swapContract");
const Provider = require("@truffle/hdwallet-provider");
// const getRepository = require("typeorm");
import { Connection, getRepository, Transaction,createQueryBuilder, TransactionRepository, Index } from "typeorm";
const privateKey ='ee7615b734368bcc3d901c76fb8882f0072ffc9b26510f2ecb062e02db386775';
const provider = new Provider(privateKey, "https://testnet.dexit.network");
const web3 = new Web3(provider);
app.use(express.json());


app.use(cors())

const contractAddrETH = '0x5f9593a343fB179C1517856A06BAC0626c0eF9F4';
const contractAddrBSC = '0x5fFD7DE1b3aF0747DBcc2624C27Ee3915AcD5C81';
const contractAddrDXT = '0x766DC779210d0f64230E94bfBa663E285C148fBb';

const ETHAPI = "https://rinkeby.infura.io/v3/bf991788cf55436c98beee4cc8507b46";
const BSCAPI = "https://data-seed-prebsc-1-s1.binance.org:8545/";
const DXTAPI = "https://testnet.dexit.network";

const providerETH = new Provider(privateKey, ETHAPI);
const providerBSC = new Provider(privateKey, BSCAPI);
const providerDXT = new Provider(privateKey, DXTAPI);

const web3ETH = new Web3(providerETH);
const web3BSC = new Web3(providerBSC);
const web3DXT = new Web3(providerDXT);

const tokenETH = new web3ETH.eth.Contract(
    Swap_ABI.ABI,
    contractAddrETH
)

const tokenBSC = new web3BSC.eth.Contract(
    Swap_ABI.ABI,
    contractAddrBSC
)

const tokenDXT = new web3DXT.eth.Contract(
    Swap_ABI.ABI,
    contractAddrDXT
)

// Function for withdraw ETH
export const claimETH = async (from:string,amount:bigint,exc_rate:number,transactionHash:string, network:string) => {
  let status = 'ok';
  let transactionDetails;
  // console.log("claiming ETH");
  // console.log("from : ",from);
  // console.log("from type : ",typeof(from));
  from = from.toLowerCase();
  // console.log("from : ",web3.utils.checkAddressChecksum(from));
  from = web3.utils.toChecksumAddress(from)
  console.log(from);
  
  // console.log("from : ",web3.utils.checkAddressChecksum(from));
  console.log(transactionHash);
  

  const hash_value = await tokenETH.methods.transactions(transactionHash).call();
  // console.log("print hash value : ",hash_value);
  
  if(hash_value == transactionHash) {
      // console.log("\nTransaction already processed");
      status = 'error';
      return{status};
  }
  if(network == 'BNB'){
     transactionDetails = await web3BSC.eth.getTransactionReceipt(transactionHash);
  }else if(network == 'DXT'){
     transactionDetails = await web3DXT.eth.getTransactionReceipt(transactionHash);
  }else{
    status = 'Unknown network';
    return{status};
  }
  
  
  // console.log("Checking credentials for transactionDetails");

  if(transactionDetails == null) {
      status = 'invalid hash';
      return{status};
  }

  // console.log("transactionDetails.from : ",transactionDetails.from );
  // console.log("from.toLowerCase() : ",from.toLowerCase());
  // console.log("transactionDetails.to : ",transactionDetails.to);
  // console.log("contractAddrETH.toLowerCase() : ",contractAddrETH.toLowerCase());
  // console.log("transactionDetails.status : ",transactionDetails.status);
  
  if (transactionDetails.from == from.toLowerCase() && transactionDetails.to == contractAddrETH.toLowerCase() && transactionDetails.status == true) {     // Needs to be converted to lower case since Metamasks check sum requires some letters to be capital and addresses returned from transaction hash are in lowercase
      status = '200';
  }

  // console.log("All checks passed...Finally claiming!");
  console.log("status is : ", status);

  const txRepo = getRepository(SwapTable);
  await txRepo.insert({from:from,amount:amount.toString(),exc_rate:exc_rate,transactionHash:transactionHash,network:network,tx_status:status})
  
 if(status == '200'){
  console.log("again status is : ", status);
    try {
      const accounts = await web3.eth.getAccounts();
      console.log(status);
      let result = await tokenETH.methods.withdraw(from,amount,exc_rate,transactionHash).send({
        from : accounts[0]
    });

    console.log("result ", result);
      console.log("BSC withdraw successfully");
      return{status, result};
    } catch (error) {
      console.log(error);
    }
  }
  // return (status,transactionHash)
}

// Function for withdraw BSC
export const claimBSC = async (from:string,amount:bigint,exc_rate:number,transactionHash:string, network:string) => {
  let status = 'ok';
  let transactionDetails
  // console.log("claiming BSC");
  // console.log("from : ",from);
  
  from = web3BSC.utils.toChecksumAddress(from);
  
  const hash_value = await tokenBSC.methods.transactions(transactionHash).call();
  console.log("print hash value : ",hash_value);
  
  if(hash_value == transactionHash) {
      // console.log("\nTransaction already processed");
      status = 'error';
      return{status};
  }
  if(network == 'ETH'){
    transactionDetails = await web3ETH.eth.getTransactionReceipt(transactionHash);
  }else if(network == 'DXT'){
    transactionDetails = await web3DXT.eth.getTransactionReceipt(transactionHash);
  }else{
    status = 'Unknown network';
    return{status};
  }
  // console.log("Checking credentials for transactionDetails",transactionDetails);

  if(transactionDetails == null) {
      status = 'invalid hash';
      return{status};
  }

  console.log("printing  transactionDetails : ",transactionDetails);
  // console.log("printing from 3 : ",from);
  
  // console.log("transactionDetails.from : ",transactionDetails.from );
  // console.log("from.toLowerCase() : ",from.toLowerCase());
  // console.log("transactionDetails.to : ",transactionDetails.to);
  // console.log("contractAddrBSC.toLowerCase() : ",contractAddrBSC.toLowerCase());
  // console.log("transactionDetails.status : ",transactionDetails.status);
  
  if (transactionDetails.from == from.toLowerCase() && transactionDetails.to == contractAddrBSC.toLowerCase() && transactionDetails.status == true) {     // Needs to be converted to lower case since Metamasks check sum requires some letters to be capital and addresses returned from transaction hash are in lowercase
    status = '200';
  }
//  console.log("All checks passed...Finally claiming!");
  console.log("status is : ", status);
  
  const txRepo = getRepository(SwapTable);
  await txRepo.insert({from:from,amount:amount.toString(),exc_rate:exc_rate,transactionHash:transactionHash,network:network,tx_status:status})

 if(status == '200'){
  // console.log("again status is : ", status);
    try {
      const accounts = await web3.eth.getAccounts();
      console.log(status);
      let result = await tokenBSC.methods.withdraw(from,amount,exc_rate,transactionHash).send({
        from : accounts[0]
    });
    console.log("result ", result);
      console.log("BSC withdraw successfully");
      return{status ,result};
    } catch (error) {
      console.log(error);
    }
  }

}

// Function for withdraw DXT
export const claimDXT = async (from:string,amount:bigint,exc_rate:number,transactionHash:string, network:string) => {
    let status = 'ok';
    let transactionDetails;
    // console.log("claiming DXT");
    // console.log("from : ",from);
    
    from = web3DXT.utils.toChecksumAddress(from);
    
    const hash_value = await tokenDXT.methods.transactions(transactionHash).call();
    // console.log("print hash value : ",hash_value);
    
    if(hash_value == transactionHash) {
        console.log("\nTransaction already processed");
        status = 'error';
    }

    if(network == 'BNB'){
      transactionDetails = await web3BSC.eth.getTransactionReceipt(transactionHash);
    }else if(network == 'ETH'){
      transactionDetails = await web3ETH.eth.getTransactionReceipt(transactionHash);
    }else{
      status = 'Unknown network';
      return{status};
    }
    // console.log("Checking credentials for transactionDetails",transactionDetails, transactionHash ,network);
  
    if(transactionDetails == null) {
        status = 'invalid hash';
        return{status};
    }
  
    // console.log("transactionDetails.from : ",transactionDetails.from );
    // console.log("from.toLowerCase() : ",from.toLowerCase());
    // console.log("transactionDetails.to : ",transactionDetails.to);
    // console.log("contractAddrDXT.toLowerCase() : ",contractAddrDXT.toLowerCase());
    // console.log("transactionDetails.status : ",transactionDetails.status);
    
    if (transactionDetails.from == from.toLowerCase() && transactionDetails.to == contractAddrDXT.toLowerCase() && transactionDetails.status == true) {     // Needs to be converted to lower case since Metamasks check sum requires some letters to be capital and addresses returned from transaction hash are in lowercase
      status = '200';
    }
  //  console.log("All checks passed...Finally claiming!");
    console.log("status is : ", status);
    
    const txRepo = getRepository(SwapTable);
    await txRepo.insert({from:from,amount:amount.toString(),exc_rate:exc_rate,transactionHash:transactionHash,network:network,tx_status:status})

   if(status == '200'){
    // console.log("again status is : ", status);
    try {
      const accounts = await web3.eth.getAccounts();
      console.log(status);
      let result = await tokenDXT.methods.withdraw(from,amount,exc_rate,transactionHash).send({
        from : accounts[0]
    });
    console.log("result ", result);
      // console.log("DXT withdraw successfully");
      return{status ,result};
    } catch (error) {
      console.log(error);
    }
  }
}
