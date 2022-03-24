
import express, { Request, Response } from "express";
import { Connection, getRepository, Transaction,createQueryBuilder, TransactionRepository, Index } from "typeorm";
import { idText } from "typescript";
// import searchTransactionByBlock from "./index1";
import { TransactionEntity } from "./txHistoryCount.entity";
import { TransactionTable } from "./txTable";
const { Client } = require('pg');
const router = express.Router();



router.get("/validatorInfo/:address", async function (req: Request, res: Response) {
  const txRepo = getRepository(TransactionEntity);
  const transactions = await txRepo.findOne({Address:req.params.address})
  res.json({ data: transactions });
});

  
router.get("/transactions", async function (req: Request, res: Response) {
  const txRepo = getRepository(TransactionTable);
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

  


 
router.post("/validatorInfo", async function (req: Request, res: Response) {
  const txRepo = getRepository(TransactionEntity);

  const tx = await txRepo.create(req.body);

  // await txRepo.insert({totalcount:count});

  const results = await txRepo.save(tx);
  return res.send(results);
  
});
 export default router;
