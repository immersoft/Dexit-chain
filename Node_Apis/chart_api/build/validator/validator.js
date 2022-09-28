"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalVotingPower = exports.getHighestValidators = void 0;
const express = require("express");
const app = express();
const cors = require("cors");
const Web3 = require("web3");
const Validator_ABI = require("./Contract");
const VProvider = require("@truffle/hdwallet-provider");
const privateKey = 'ee7615b734368bcc3d901c76fb8882f0072ffc9b26510f2ecb062e02db386775';
const provider = new VProvider(privateKey, "https://testnet.dexit.network");
const web3 = new Web3(provider);
app.use(express.json());
app.use(cors());
const Validator = new web3.eth.Contract(Validator_ABI.contractAbi, Validator_ABI.contractAddress);
const getHighestValidators = () => __awaiter(void 0, void 0, void 0, function* () {
    var highestValidators = yield Validator.methods.getHighestValidators().call();
    console.log(highestValidators);
    return highestValidators.length;
});
exports.getHighestValidators = getHighestValidators;
const getTotalVotingPower = () => __awaiter(void 0, void 0, void 0, function* () {
    var totalVotingPower = yield Validator.methods.totalDXTStake().call();
    console.log(totalVotingPower);
    return totalVotingPower.toString();
});
exports.getTotalVotingPower = getTotalVotingPower;
