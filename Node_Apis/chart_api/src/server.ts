
import express, { Request, Response } from "express";
import { createConnection, getRepository } from "typeorm";
import { transactionHistoryCount } from "./txHistory";
import { TransactionEntity } from "./txHistoryCount.entity";
import {TransactionTimesEntity} from "./txChart.entity";
import {SwapTable} from "./swap/swapHistory";
import {BlockTransactionEntity} from './txTransactionCount.entity'

import Router from "./txRouter";
import Web3 from "web3";
import { TransactionTable } from "./txTable";
const cors=require('cors')
const app = express();
app.use(express.json());
app.use(cors())

export const connection = createConnection({
  type: "postgres",
  host: "castor.db.elephantsql.com",
  port: 5432, // default port of postgres
  username: "mrabouuj",
  password: "QvhCQM5jwdFFh7kHdzPW2nN2uI7fxNYS",
  database: "mrabouuj",
  entities: [TransactionEntity,TransactionTable,SwapTable,TransactionTimesEntity,BlockTransactionEntity],
  synchronize: true,
  logging: false,
})
  .then(async(connection) => {
  
    const repository = connection.getRepository(TransactionTimesEntity);

   
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

app.get("/", function (req,res) {
  res.send("API running!");
});




app.use(Router);

const port = process.env.PORT || 5000; 

app.listen(port, () => {
  console.log(`server running at port:${port}`);
});
