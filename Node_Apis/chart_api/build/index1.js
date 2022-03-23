"use strict";
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
const web3_1 = __importDefault(require("web3"));
const express_1 = __importDefault(require("express"));
const typeorm_1 = require("typeorm");
const txHistoryCount_entity_1 = require("./txHistoryCount.entity");
var http = require('http');
const app = (0, express_1.default)();
app.use(express_1.default.json());
const web3 = new web3_1.default();
web3.setProvider("https://testnet.dexit.network");
let start = 1;
let init = 1;
let daylastblock = 0;
let count = 0;
let ft = 1646289053;
function searchTransactionByBlock() {
    return __awaiter(this, void 0, void 0, function* () {
        //     let count=0
        //     let currentBlock = await web3.eth.getBlockNumber()
        //     console.log(currentBlock);
        //    let start=0;
        //    let end =0;
        // //    let getBlockDetails = await web3.eth.getBlock(10000);
        // //    let x=getBlockDetails.timestamp;
        // //        console.log("geteeee",x);
        //  for(let i=1;i<=22;i++){
        //         let getBlockDetails = await web3.eth.getBlock(i);
        //         if(getBlockDetails.timestamp>=1646202713){
        //             console.log(getBlockDetails.number)
        //           process.exit();
        //             //1646309151
        //         }
        //         console.log("geteeee",getBlockDetails.number);
        //        console.log("geteeee",getBlockDetails.timestamp);
        //     if(getBlockDetails.transactions.length > 0){
        //         count+=getBlockDetails.transactions.length
        //     //console.log(getBlockDetails.transactions.length)
        //     }
        //     }
        //     // router.post("/tx", async function (req: Request, res: Response) {
        //     //     console.log(count,"inside post");
        //     //       const txRepo = getRepository(TransactionEntity);
        //     //       const tx = await txRepo.create(req.body);
        //     //       const results = await txRepo.save(tx);
        //     //       return res.send(results);
        //     //     });
        //     console.log(count,"inside indexts1");
        //     // call putapi send count
        //     return count;
        console.log(ft, 'time');
        let currentBlock = yield web3.eth.getBlockNumber();
        for (let i = start; i <= currentBlock; i++) {
            let getBlockDetails = yield web3.eth.getBlock(i);
            if (getBlockDetails.timestamp >= ft) {
                daylastblock = getBlockDetails.number;
                console.log(daylastblock);
                counttransactionperday();
                ft = ft + 86400;
                break;
            }
            //  ft=ft+86400;
            // console.log(start);
        }
        start = daylastblock + 1;
        console.log(start, 'start');
        function counttransactionperday() {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('out of first loop');
                console.log(daylastblock, 'last day block');
                for (let j = init; j <= daylastblock; j++) {
                    let getBlockDetails = yield web3.eth.getBlock(j);
                    if (getBlockDetails.transactions.length > 0) {
                        count += getBlockDetails.transactions.length;
                    }
                }
                init = daylastblock;
                console.log(init, 'init');
                console.log(count, 'count');
                //insert query 
                yield (0, typeorm_1.getConnection)()
                    .createQueryBuilder()
                    .insert()
                    .into(txHistoryCount_entity_1.TransactionEntity)
                    .values([
                    { totalcount: count }
                ])
                    .execute();
                console.log('dfjsgsdhv');
                count = 0;
            });
        }
        console.log('out of second loop');
        return count;
    });
}
exports.default = searchTransactionByBlock;
//searchTransactionByBlock()