const express = require("express");
const app = express();
const cors = require("cors");
const Web3 = require("web3");
const Validator_ABI = require("./Contract");
const VProvider = require("@truffle/hdwallet-provider");
const privateKey ='ee7615b734368bcc3d901c76fb8882f0072ffc9b26510f2ecb062e02db386775';
const provider = new VProvider(privateKey, "https://testnet.dexit.network");
const web3 = new Web3(provider);
app.use(express.json());


app.use(cors())


const Validator = new web3.eth.Contract(
    Validator_ABI.contractAbi,
    Validator_ABI.contractAddress
)

export const getHighestValidators = async() => {
    var highestValidators = await Validator.methods.getHighestValidators().call()
    console.log(highestValidators);
    return highestValidators.length
}


export const getTotalVotingPower = async() => {
    var totalVotingPower = await Validator.methods.totalDXTStake().call()
    console.log(totalVotingPower);
    return totalVotingPower.toString()
}
