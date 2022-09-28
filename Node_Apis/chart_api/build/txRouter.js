"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const typeorm_1 = require("typeorm");
const index1_1 = __importDefault(require("./index1"));
const txHistoryCount_entity_1 = require("./txHistoryCount.entity");
const Validator = __importStar(require("./validator/validator"));
const txTransactionCount_entity_1 = require("./txTransactionCount.entity");
const txTable_1 = require("./txTable");
const bigInt = require("big-integer");
const { Client } = require('pg');
const router = express_1.default.Router();
const Web3Token = require('web3-token');
const solc = require('solc');
const fs = require('fs');
let DirName = './src/contract/';
let DirName2 = './build/contract/';
var formidable = require('formidable');
var util = require("util");
const path = require('path');
router.get("/validatorInfo/:address", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const txRepo = (0, typeorm_1.getRepository)(txHistoryCount_entity_1.TransactionEntity);
        const transactions = yield txRepo.findOne({ Address: req.params.address });
        res.json({ data: transactions });
    });
});
router.get("/transactions", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const txRepo = (0, typeorm_1.getRepository)(txTable_1.TransactionTableCounter);
        const transactions = yield txRepo.find();
        let ID = transactions.map((tx) => tx.id);
        res.json({ data: transactions });
        console.log(ID.length);
        // let t=0;
        //  t=t+5;
        //   if(ID.length>=15){
        //     const we=txRepo.createQueryBuilder().delete()
        //     .from(TransactionTimesEntity)
        //     .where("id <= :id", { id: ID[14] })
        //     .execute()
        //   }
    });
});
const count = (0, index1_1.default)();
console.log(count, 'final count wait for 24 hours');
setInterval(function () {
    (0, index1_1.default)();
    console.log("function");
}, 60000 * 60 * 3);
router.post("/tx", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(count, "inside post");
        const txRepo = (0, typeorm_1.getRepository)(txTable_1.TransactionTableCounter);
        const tx = yield txRepo.create(req.body);
        const { tcount } = req.body;
        yield txRepo.insert({ totalcount: yield count });
        const results = yield txRepo.save(tx);
        return res.send(results);
    });
});
router.post("/validatorInfo", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const txRepo = (0, typeorm_1.getRepository)(txHistoryCount_entity_1.TransactionEntity);
        const get = yield txRepo.findOne({ Address: req.body.Address });
        if (get) {
            res.json({ data: "Already Exist" });
        }
        else {
            const tx = yield txRepo.create(req.body);
            const results = yield txRepo.save(tx);
            return res.send(results);
        }
    });
});
router.get("/blockstransactions", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const txRepo = (0, typeorm_1.getRepository)(txTransactionCount_entity_1.BlockTransactionEntity);
        const transactions = yield txRepo.find();
        // console.log("hi")
        res.json({ data: transactions });
    });
});
router.post("/blockstransactioncount", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const txRepo = (0, typeorm_1.getRepository)(txTransactionCount_entity_1.BlockTransactionEntity);
        const tx = yield txRepo.create(req.body);
        const results = yield txRepo.save(tx);
        return res.send(results);
    });
});
router.post('/transactioncountupdate/:id', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const txRepo = (0, typeorm_1.getRepository)(txTransactionCount_entity_1.BlockTransactionEntity);
            // console.log(req.body,"body data")
            const tx = yield txRepo.create(req.body);
            const { count, start } = req.body;
            const results = yield txRepo.update({ id: 1 }, { count: count, start: start });
            return res.send(results);
        }
        catch (error) {
            console.log(error);
        }
    });
});
/**************************validator api**************************/
router.get("/getHighestValidators", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const highestValidators = yield Validator.getHighestValidators();
        console.log(highestValidators, "lll");
        res.json({ data: highestValidators });
    });
});
router.get("/getvotingpower", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const votingpower = yield Validator.getTotalVotingPower();
        console.log(votingpower, "lll");
        res.json({ data: votingpower });
    });
});
/**************************Contract Compile**************************/
router.post("/writeFile", function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        fs.writeFile(`${DirName2}Demo.sol`, fields.code, (err) => {
            if (err) {
                throw err;
            }
        });
        return res.send(fields.code);
    });
});
router.post("/newversion", function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        // fs.writeFile(`${DirName2}Demo.sol`,fields.code , (err:any) => {
        //       if (err) {
        //           throw err;
        //       }
        // });
        try {
            const bettingPath = path.resolve(__dirname, 'contract', 'Demo.sol');
            console.log(bettingPath, "second");
            const source = fs.readFileSync(bettingPath, 'utf-8');
            console.log(source, "third");
            const input = {
                language: 'Solidity',
                sources: {
                    'Demo.sol': {
                        content: source,
                    },
                },
                settings: {
                    outputSelection: {
                        '*': {
                            '*': ['*']
                        }
                    }
                }
            };
            console.log(input, "output");
            var output = JSON.parse(solc.compile(JSON.stringify(input)));
            ;
            console.log(output, "output");
            const LotteryContract = output.contracts['Demo.sol'];
            console.log(LotteryContract, "contract");
            const result = Object.keys(LotteryContract)[0];
            res.json({ data: LotteryContract });
            // res.json({ data2: LotteryContract });
        }
        catch (error) {
            console.log(error);
        }
        // const result = solc.compile(fields.code,1).contracts
        // console.log(Object.keys(result),"object data")
        // res.writeHead(200, {'content-type': 'text/plain'});
        // res.end(util.inspect({fields: result}));
    });
    form.on('error', function (err) {
        console.error(err);
    });
    form.on('progress', function (bytesReceived, bytesExpected) {
        var percent_complete = (bytesReceived / bytesExpected) * 100;
        console.log(percent_complete.toFixed(2));
    });
});
/*********************Swap Router*************************/
// router.get("/withdraw/recover/:from", async function (req: Request, res: Response) {
//   console.log(req.params.from);
//   const txRepo = getRepository(SwapTable);
//   const transactions = await txRepo.find({where:{from:req.params.from}});
//   if(!transactions){
//     return null
//   }
//   // console.log(transactions);    
//   res.json({transactions});
// });
// router.get("/withdraw/recover", async function (req: Request, res: Response) {
//   console.log(req.params.from);
//   const txRepo = getRepository(SwapTable);
//   const transactions = await txRepo.find();
//   res.json({ data: transactions });
// });
// router.post("/withdraw/ETH", async function (req: Request, res: Response) { 
//   const token = req.headers['authorization']
//   const {address} = await Web3Token.verify(token);
//   // console.log("printing req : ",req);
//   // console.log("printing req.body.from : ",req.body.from)
//   var key1 = req.body.from;
//   console.log("printing key1 : ",key1);
//   console.log("typeof key1 : ",typeof(key1));
//   var key2 = bigInt(req.body.amount);
//   var key3 = req.body.exc_rate;
//   var key4 = req.body.transactionHash;
//   var key5 = req.body.network;
//   console.log("key4 : ",key4);
//   if(key1.toLowerCase() == address.toLowerCase()){
//     const result = await Swap.claimETH(key1, key2.value, key3, key4, key5);
//     res.send(result);
//   }
// });
// router.post("/withdraw/BSC",async function (req: Request, res: Response) {
// const token = req.headers['authorization']
// const { address } = await Web3Token.verify(token);
// var key1 = req.body.from;
// var key2 = bigInt(req.body.amount);
// var key3 = req.body.exc_rate;
// var key4 = req.body.transactionHash;
// var key5 = req.body.network;
// console.log(key1.toLowerCase()==address.toLowerCase(),"insideeee");
// console.log("key1 : ",key1, "\n address : ",address);
// if(key1.toLowerCase() == address.toLowerCase()){
//   const result = await Swap.claimBSC(key1, key2.value, key3, key4, key5);
//   res.send(result);
// }
// });
// router.post("/withdraw/DXT",async function (req: Request, res: Response) {
// const token = req.headers['authorization']
// const { address } = await Web3Token.verify(token);
// console.log("printing req.body : ",req.body);
// var key1 = req.body.from;
// var key2 = bigInt(req.body.amount);
// var key3 = req.body.exc_rate;
// var key4 = req.body.transactionHash;
// var key5 = req.body.network;
// var key6 = key2.toString();
// console.log("key1 : ",key1, "\n address : ",address);
// console.log(key1.toLowerCase()==address.toLowerCase(),"insideeee");
// if(key1.toLowerCase() == address.toLowerCase()){
//   const result = await Swap.claimDXT(key1, key2.value, key3, key4, key5);
//   console.log("this is post API result : ",result);
//   res.send(result);
// }
// });
exports.default = router;
