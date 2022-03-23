
import express, { Request, Response } from "express";
import { Connection, getRepository, Transaction,createQueryBuilder, TransactionRepository, Index } from "typeorm";
import { idText } from "typescript";
import searchTransactionByBlock from "./index1";
import { TransactionEntity } from "./txHistoryCount.entity";
const { Client } = require('pg');
const router = express.Router();



router.get("/transactions", async function (req: Request, res: Response) {
  const txRepo = getRepository(TransactionEntity);
  const transactions = await txRepo.find()
  let ID = transactions.map((tx) => tx.id)
  res.json({ data: transactions });
  console.log(ID.length);
  
  
let t=0;
 t=t+5;
  if(ID.length>=15){
    const we=txRepo.createQueryBuilder().delete()
    .from(TransactionEntity)
    .where("id <= :id", { id: ID[14] })
    .execute()

  
  }
 
});

const count=   searchTransactionByBlock();
console.log(count,'final count wait for 3 hours')

setInterval(function(){ 
 
  searchTransactionByBlock();
   },60000*60*3);

  

router.post("/tx", async function (req: Request, res: Response) {
  
console.log(count,"inside post");
let we =2;
  const txRepo = getRepository(TransactionEntity);
  
  const tx = await txRepo.create(req.body);
  const {tcount} = req.body;
  // await txRepo.insert({totalcount:count});
  // const results = await txRepo.save(tx);
  // return res.send(results);
  
});
// router.put("/update:id", async function (req: Request, res: Response) {
//   const txRepo = getRepository(TransactionEntity);
//   const tx = await txRepo.create(req.body);

//   const { count , start } = req.body;
//    const results = await txRepo.update({id: 1}, {count:count,start:start});
//   return res.send(results);
// });

export default router;
