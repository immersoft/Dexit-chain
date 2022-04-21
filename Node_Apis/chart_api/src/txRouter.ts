
import express, { Request, Response } from "express";
import { Connection, getRepository, Transaction,createQueryBuilder, TransactionRepository, Index } from "typeorm";
import { idText } from "typescript";
import searchTransactionByBlock from "./index1";
import { TransactionEntity } from "./txHistoryCount.entity";
import {TransactionTimesEntity} from "./txChart.entity";
import {BlockTransactionEntity} from './txTransactionCount.entity'
import { TransactionTable } from "./txTable";
import * as Swap from "./swap/swap";
const bigInt = require ("big-integer");
const { Client } = require('pg');
const router = express.Router();

console.log(Swap);

router.get("/validatorInfo/:address", async function (req: Request, res: Response) {
  const txRepo = getRepository(TransactionEntity);
  const transactions = await txRepo.findOne({Address:req.params.address})
  res.json({ data: transactions });
});

  
router.get("/transactions", async function (req: Request, res: Response) {
  const txRepo = getRepository(TransactionTimesEntity);
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
      const txRepo = getRepository(TransactionTimesEntity);
      
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

/*********************Swap Router*************************/

router.post("/withdraw/ETH", function (req: Request, res: Response) {
  var key1 = req.body.from;
  var key2 = bigInt(req.body.amount);
  var key3 = req.body.exc_rate;
  var key4 = req.body.transactionHash;
  const result = Swap.claimETH(key1, key2.value, key3, key4);
  res.send(result);
});

router.post("/withdraw/BSC", function (req: Request, res: Response) {
  var key1 = req.body.from;
  var key2 = bigInt(req.body.amount);
  var key3 = req.body.exc_rate;
  var key4 = req.body.transactionHash;
  const result = Swap.claimBSC(key1, key2.value, key3, key4);
  res.send(result);
});

router.post("/withdraw/DXT", function (req: Request, res: Response) {
  var key1 = req.body.from;
  var key2 = bigInt(req.body.amount);
  var key3 = req.body.exc_rate;
  var key4 = req.body.transactionHash;
  const result = Swap.claimDXT(key1, key2.value, key3, key4);
  res.send(result);
});

 export default router;
