const express = require("express");
const app = express();
const cors = require("cors");
const Web3 = require("web3");
const Swap_ABI = require("./swapContract");
const Provider = require("@truffle/hdwallet-provider");
const { ethers } = require("ethers");
const bigInt = require ("big-integer");
const privateKey ='ee7615b734368bcc3d901c76fb8882f0072ffc9b26510f2ecb062e02db386775';

const contractAddrETH = '0x90B08Dda5435Ad7055874FC1Af52bF5834321B56';
const contractAddrBSC = '0x822D31469f56bA04d8081B7F1BE93F0113b7aa73';
const contractAddrDXT = '0x441aBf4850d46A7a136542BBc40B7d1246dE25B6';

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


// Function for charging transaction fees
const authETH = async (from:string, transactionHash:string) => {
    let status = 'ok';
    from = Web3.utils.toChecksumAddress(from)
    const hash_value = await Swap_ABI.methods.transactions(transactionHash).call();
    
    if(hash_value) {
        console.log("\nTransaction already processed");
        status = 'error';
        return status;
    }

    const transactionDetails = await Web3.eth.getTransactionReceipt(transactionHash);
    console.log("Checking credentials for transactionDetails" ,transactionDetails);
  
    if(transactionDetails == null) {
        status = 'invalid hash';
        return status;
    }
  
    if (transactionDetails.from == from.toLowerCase() && transactionDetails.to == contractAddrETH && transactionDetails.status == true) {     // Needs to be converted to lower case since Metamasks check sum requires some letters to be capital and addresses returned from transaction hash are in lowercase
        console.log("\nTransaction details do not match with provided hash");
        return;
    }
  console.log("All checks passed for authETH...Finally claiming!");
}

const authBSC = async (from:string, transactionHash:string) => {
    let status = 'ok';
    from = web3BSC.utils.toChecksumAddress(from);
    const hash_value = await Swap_ABI.methods.transactions(transactionHash).call();
    
    if(hash_value) {
        console.log("\nTransaction already processed");
        status = 'error';
        return status;
    }

    const transactionDetails = await web3BSC.eth.getTransactionReceipt(transactionHash);
    console.log("Checking credentials for transactionDetails" ,transactionDetails);
  
    if(transactionDetails == null) {
        status = 'invalid hash';
        return status;
    }
  
    if (transactionDetails.from == from.toLowerCase() && transactionDetails.to == contractAddrBSC && transactionDetails.status == true) {     // Needs to be converted to lower case since Metamasks check sum requires some letters to be capital and addresses returned from transaction hash are in lowercase
        console.log("\nTransaction details do not match with provided hash");
        return;
    }
  console.log("All checks passed for authBSC...Finally claiming!");
}

const authDXT = async (from:string, transactionHash:string) => {
    let status = 'ok';
    from = web3DXT.utils.toChecksumAddress(from);
    const hash_value = await Swap_ABI.methods.transactions(transactionHash).call();
    
    if(hash_value) {
        console.log("\nTransaction already processed");
        status = 'error';
        return status;
    }

    const transactionDetails = await web3DXT.eth.getTransactionReceipt(transactionHash);
    console.log("Checking credentials for transactionDetails" ,transactionDetails);
  
    if(transactionDetails == null) {
        status = 'invalid hash';
        return status;
    }
  
    if (transactionDetails.from == from.toLowerCase() && transactionDetails.to == contractAddrDXT && transactionDetails.status == true) {     // Needs to be converted to lower case since Metamasks check sum requires some letters to be capital and addresses returned from transaction hash are in lowercase
        console.log("\nTransaction details do not match with provided hash");
        return;
    }
  console.log("All checks passed...Finally claiming!");
}