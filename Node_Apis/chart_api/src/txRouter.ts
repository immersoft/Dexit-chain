import express, { Request, Response } from "express";
import { Connection, getRepository, Transaction,createQueryBuilder, TransactionRepository, Index } from "typeorm";
import { idText } from "typescript";
import searchTransactionByBlock from "./index1";
import { TransactionEntity } from "./txHistoryCount.entity";
import {SwapTable} from "./swap/swapHistory.entity";
import * as Swap from "./swap/swap";
import * as Validator from "./validator/validator";

import {TransactionTimesEntity} from "./txChart.entity";
import {BlockTransactionEntity} from './txTransactionCount.entity'
import { TransactionTableCounter } from "./txTable";

const bigInt = require ("big-integer");
const { Client } = require('pg');
const router = express.Router();
const Web3Token = require('web3-token');
const solc=require('solc');
const fs = require('fs');
let DirName='./src/contract/';
let DirName2='./build/contract/';
var formidable = require('formidable');
var util = require("util"); 
const path= require('path');
console.log("in txrouter file")
router.get("/validatorInfo/:address", async function (req: Request, res: Response) {
  const txRepo = getRepository(TransactionEntity);
  const transactions = await txRepo.findOne({Address:req.params.address})
  res.json({ data: transactions });
});

  
router.get("/transactions", async function (req: Request, res: Response) {
  const txRepo = getRepository(TransactionTableCounter);
  const transactions = await txRepo.find()
  let ID = transactions.map((tx) => tx.id)
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

const count=searchTransactionByBlock();
console.log(count,'final count wait for 24 hours')

setInterval(function(){ 
  searchTransactionByBlock();
  console.log("function")
   }, 60000*60*3);

 
router.post("/tx", async function (req: Request, res: Response) {
  
  console.log(count,"inside post");
      const txRepo = getRepository(TransactionTableCounter);
      
      const tx = await txRepo.create(req.body);
      const {tcount} = req.body;
      await txRepo.insert({totalcount:await count});
      const results = await txRepo.save(tx);
      return res.send(results);
      
    });


router.post("/validatorInfo", async function (req: Request, res: Response) {
  const txRepo = getRepository(TransactionEntity);
  const get = await txRepo.findOne({Address:req.body.Address})
  if(get){
    res.json({ data: "Already Exist" });
  }
  else{
    const tx = await txRepo.create(req.body);
    const results = await txRepo.save(tx);
    return res.send(results);
  }
});



router.get("/blockstransactions", async function (req: Request, res: Response) {
  const txRepo = getRepository(BlockTransactionEntity);
  const transactions = await txRepo.find()
  // console.log("hi")
  res.json({ data: transactions });
});


router.post("/blockstransactioncount", async function (req: Request, res: Response) {
  const txRepo = getRepository(BlockTransactionEntity);
  const tx = await txRepo.create(req.body);
  
  const results = await txRepo.save(tx);
  return res.send(results);
});

router.post('/transactioncountupdate/:id', async function (req: Request, res: Response) {
 try {
  const txRepo = getRepository(BlockTransactionEntity);
  // console.log(req.body,"body data")

  const tx = await txRepo.create(req.body);
  const { count , start } = req.body;
   const results = await txRepo.update({id: 1}, {count:count,start:start});
  return res.send(results);
 } catch (error) {
   console.log(error)
 }
 
});


/**************************validator api**************************/
router.get("/getHighestValidators", async function (req: Request, res: Response) {
  const highestValidators = await Validator.getHighestValidators();
  console.log(highestValidators,"lll");
  res.json({ data: highestValidators });
});


router.get("/getvotingpower", async function (req: Request, res: Response) {
  const votingpower = await Validator.getTotalVotingPower();
  console.log(votingpower,"lll");
  res.json({ data: votingpower });
});



/**************************Contract Compile**************************/


router.post("/writeFile", function (req: Request, res: Response) {
  var form = new formidable.IncomingForm();
  form.parse(req,function(err:any,fields:any,files:any){
    fs.writeFile(`${DirName2}Demo.sol`,fields.code,(err:any)=>{
      if(err){
        throw err;
      }
    })
    return res.send(fields.code);
  })
});

router.post("/newversion", function(req, res, next){ 
  var form = new formidable.IncomingForm();
  form.parse(req, function(err:any, fields:any, files:any) {
    

try {
  const bettingPath = path.resolve(__dirname, 'contract','Demo.sol');
  console.log(bettingPath,"second")

  const source = fs.readFileSync(bettingPath, 'utf-8');
  console.log(source,"third")

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

  var output = JSON.parse(solc.compile(JSON.stringify(input)));;
  // console.log(output,"output");
  const LotteryContract = output.contracts['Demo.sol'];
  console.log(LotteryContract,"contract");
  const result=Object.keys(LotteryContract)[0];
  res.json({ data: LotteryContract });

} catch (error) {
  console.log(error,"Please create contract folder and demo.sol file in build folder")
}
  });
  form.on('error', function(err:any) {
      console.error(err);
  });
  form.on('progress', function(bytesReceived:any, bytesExpected:any) {
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



export default router;
