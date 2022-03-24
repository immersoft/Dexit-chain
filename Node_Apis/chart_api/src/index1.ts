
import { appendFile } from "fs";
import Web3 from "web3";
import router from "./txRouter";
import express, { Request, Response } from "express";
import { getRepository, InsertQueryBuilder, Timestamp } from "typeorm";
import {getConnection} from "typeorm";

import { TransactionEntity } from "./txHistoryCount.entity";
import { Http2ServerRequest } from "http2";
import { urlToHttpOptions } from "url";
import { url } from "inspector";
import { exit } from "process";
import { Query } from "typeorm/driver/Query";
import { TransactionTable } from "./txTable";
var http = require('http');
const app = express();
app.use(express.json());

const web3 = new Web3();


web3.setProvider("https://testnet.dexit.network");


let start =1;
let init=1;
let daylastblock=0;
let count=0;
let ft = 1646289053;
export default async function searchTransactionByBlock() {


console.log(ft,'time');
let currentBlock = await web3.eth.getBlockNumber()
    for(let i =start;i<=currentBlock;i++){
               
        let getBlockDetails = await web3.eth.getBlock(i);
                if(getBlockDetails.timestamp>= ft){
                    daylastblock= getBlockDetails.number;
                    console.log(daylastblock);
                   counttransactionperday();
                   ft=ft+86400;
                    break;
    }  
    //  ft=ft+86400;
    
    // console.log(start);
    
}
start=daylastblock+1;
console.log(start,'start');

async function counttransactionperday() {


console.log('out of first loop');

console.log(daylastblock,'last day block');

for(let j=init;j<=daylastblock;j++){
    let getBlockDetails = await web3.eth.getBlock(j);
    
    if(getBlockDetails.transactions.length > 0){
             count+=getBlockDetails.transactions.length
    }
}
init=daylastblock;
console.log(init,'init');

console.log(count,'count');
//insert query 


await getConnection()
    .createQueryBuilder()
    .insert()
    .into(TransactionTable)
    .values([
        { totalcount: count}
     ])
    .execute();

console.log('dfjsgsdhv');
count=0;
}

console.log('out of second loop');

return count;
    
}
  // searchTransactionByBlock()