
import express, { Request, Response } from "express";
import { Connection, getRepository, Transaction,createQueryBuilder, TransactionRepository, Index } from "typeorm";
import { idText } from "typescript";
import searchTransactionByBlock from "./index1";
import { TransactionEntity } from "./txHistoryCount.entity";
import {TransactionTimesEntity} from "./txChart.entity";

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
  
  
let t=0;
 t=t+5;
  if(ID.length>=15){
    const we=txRepo.createQueryBuilder().delete()
    .from(TransactionTimesEntity)
    .where("id <= :id", { id: ID[14] })
    .execute()
  }
});

const count=   searchTransactionByBlock();
console.log(count,'final count wait for 24 hours')

setInterval(function(){ 
  searchTransactionByBlock();
  console.log("function")
   },60000*60*12);
 
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




/*********************Swap Router*************************/

router.post("/withdraw", function (req: Request, res: Response) {
  var key1 = req.body.account;
  var key2 = bigInt(req.body.amount);
  var key3 = req.body.exc_rate;
  var key4 = req.body.txn_hash;
  const result = Swap.withdraw(key1, key2.value, key3, key4);
  res.send(result);
});

 export default router;
