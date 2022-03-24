
import express, { Request, Response } from "express";
import { Connection, getRepository, Transaction,createQueryBuilder, TransactionRepository, Index } from "typeorm";
import { idText } from "typescript";
// import searchTransactionByBlock from "./index1";
import { TransactionEntity } from "./txHistoryCount.entity";
const { Client } = require('pg');
const router = express.Router();



router.get("/validatorInfo/:address", async function (req: Request, res: Response) {
  const txRepo = getRepository(TransactionEntity);
  const transactions = await txRepo.findOne({Address:req.params.address})
  res.json({ data: transactions });
});

  



 
router.post("/validatorInfo", async function (req: Request, res: Response) {
  const txRepo = getRepository(TransactionEntity);

  const tx = await txRepo.create(req.body);

  // await txRepo.insert({totalcount:count});
 
  const results = await txRepo.save(tx);
  return res.send(results);
  
});
// router.put("/update:id", async function (req: Request, res: Response) {
//   const txRepo = getRepository(TransactionEntity);
//   const tx = await txRepo.create(req.body);

//   const { count , start } = req.body;
//    const results = await txRepo.update({id: 1}, {count:count,start:start});
//   return res.send(results);
// });

export default router;
