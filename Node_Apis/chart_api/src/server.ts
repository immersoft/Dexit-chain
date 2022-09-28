
import express, { Request, Response } from "express";
import { createConnection, getRepository } from "typeorm";
import { transactionHistoryCount } from "./txHistory";
import { TransactionEntity } from "./txHistoryCount.entity";
import {TransactionTimesEntity} from "./txChart.entity";
import {BlockTransactionEntity} from './txTransactionCount.entity'
import {SwapTable} from './swap/swapHistory.entity'
import Router from "./txRouter";
import Web3 from "web3";
import { TransactionTableCounter } from "./txTable";
const cors=require('cors')
const app = express();
app.use(express.json());
app.use(cors())
require("dotenv").config();

export const connection = createConnection({
  type: "postgres",
  host: "castor.db.elephantsql.com",
  port: 5432, // default port of postgres
  username: "mrabouuj",
  password: "QvhCQM5jwdFFh7kHdzPW2nN2uI7fxNYS",
  database: "mrabouuj",
  entities: [TransactionEntity,TransactionTableCounter,TransactionTimesEntity,BlockTransactionEntity,SwapTable],
  synchronize: true,
  logging: false,
})
  .then(async(connection) => {
  
    const repository = connection.getRepository(TransactionTableCounter);

   
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

app.get("/", function (req,res) {
  res.send("API running!");
});



app.use(Router);

const port = process.env.PORT || 3000; 

app.listen(port, () => {
  console.log(`server running at port:${port}`);
});