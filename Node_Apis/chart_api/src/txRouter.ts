import express, { Request, Response } from "express";
import { Connection, getRepository, Transaction,createQueryBuilder, TransactionRepository, Index } from "typeorm";
import { idText } from "typescript";
import searchTransactionByBlock from "./index1";
import { TransactionEntity } from "./txHistoryCount.entity";
import {TransactionTimesEntity} from "./txChart.entity";
import {BlockTransactionEntity} from './txTransactionCount.entity'
import { TransactionTableCounter } from "./txTable";

const router = express.Router();
const solc=require('solc');
const fs = require('fs');
let DirName='./src/contract/';
let DirName2='./build/contract/';
var qs = require('querystring');
var formidable = require('formidable');
var util = require("util"); 
const path= require('path');

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


router.post("/deploy", function (req: Request, res: Response) {
  // console.log(req,"jjjj")

  let code = '';
  // console.log(req.rawHeaders,"raw headers output")

  // var key1 = req.body.code

  // function hex_to_ascii(str1:any)
  // {
  //  var hex  = str1.toString();
  //  var str = '';
  //  for (var n = 0; n < hex.length; n += 2) {
  //    str += String.fromCharCode(parseInt(hex, 16));
  //  }
  //  return str;
  // }


    if (req.method == 'POST') {
        var body = '';

        req.on('data', function (data) {
            body += data;
        });

        req.on('end', function () {
        console.log(body,"body")
           
        var post = qs.parse(body);

        //   fs.writeFileSync(`${DirName}demo.sol`, post.toString(), (err:any) => {
        //     if (err) {
        //         throw err;
        //     }
        // });

        code = post.code;
        console.log(post,"klklklkl")
        // console.log(post,"klklklkl")
        // console.log(solc.compile(post.data, 1).contracts[":Lottery"])
        // console.log(solc.compile(post.data,1))
        // console.log(post.replace('/n', ''))
        // use post['blah'], etc.
        });
    }


//   fs.writeFile(`${DirName}demo.sol`, "key2", (err:any) => {
//     if (err) {
//         throw err;
//     }
// });

});

// const fs = require('fs');

const writeFile = async (req: Request, res: Response) => {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err:any, fields:any, files:any){
    fs.writeFile(`${DirName2}Demo.sol`, fields.code, (err:any) => {
      if (err) {
          throw err;
      }
  });
  }
)}
// router.post("/writeFile",writeFile);




 router.post("/upload", function(req, res, next){ 
  var form = new formidable.IncomingForm();
  form.parse(req, function(err:any, fields:any, files:any) {
      // `file` is the name of the <input> field of type `file`
      console.log(files,"1st");
      console.log(fields,"2nd");
      console.log(fields.code,"3nd");
      //  console.log(solc.compile(fields.code, 1).contracts[":Lottery"])
      console.log(solc.compile(fields.code, 1))
      const result = solc.compile(fields.code,1).contracts
      // console.log(fields.code.splice(14),"4nd");
      // console.log(typeof(result),"typeoff")
      // console.log(solc.compile(post.data,1))
      // if(result){
      console.log(Object.keys(result),"object data")

      res.writeHead(200, {'content-type': 'text/plain'});
      // res.write('received upload:\n\n');
      res.end(util.inspect({fields: result}));
      // }
      // res.json({data:final})
      // res.json({ data: result });
      // return result
  });
  form.on('error', function(err:any) {
      console.error(err);
  });
  form.on('progress', function(bytesReceived:any, bytesExpected:any) {
      var percent_complete = (bytesReceived / bytesExpected) * 100;
      console.log(percent_complete.toFixed(2));
  });
  // form.on('end', function(fields:any, files:any) {
  //     /* Temporary location of our uploaded file */
  //     var temp_path = this.openedFiles[0].path;
  //     /* The file name of the uploaded file */
  //     var file_name = this.openedFiles[0].name;
  //     /* Location where we want to copy the uploaded file */
  //     var new_location = './src/contract/';

  //     fs.readFile(`${DirName}demo.sol`, function(err:any, data:any) {
  //         fs.writeFile(new_location + file_name, data, function(err:any) {
  //             fs.unlink(temp_path, function(err:any) {
  //                 if (err) {
  //                     console.error(err);
  //                     } else {
  //                     console.log("success!");
  //                 }
  //             });
  //         });
  //     });
  // });
});


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
    
  // fs.writeFile(`${DirName2}Demo.sol`,fields.code , (err:any) => {
  //       if (err) {
  //           throw err;
  //       }
  // });

  

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

  console.log(input,"output");
  var output = JSON.parse(solc.compile(JSON.stringify(input)));;
  console.log(output,"output");
  const LotteryContract = output.contracts['Demo.sol'];
  console.log(LotteryContract,"contract");
  const result=Object.keys(LotteryContract)[0];
  res.json({ data: LotteryContract });
  // res.json({ data2: LotteryContract });

} catch (error) {
  console.log(error)
}
      // const result = solc.compile(fields.code,1).contracts
      // console.log(Object.keys(result),"object data")

      // res.writeHead(200, {'content-type': 'text/plain'});
      // res.end(util.inspect({fields: result}));
  });
  form.on('error', function(err:any) {
      console.error(err);
  });
  form.on('progress', function(bytesReceived:any, bytesExpected:any) {
      var percent_complete = (bytesReceived / bytesExpected) * 100;
      console.log(percent_complete.toFixed(2));
  });
});


 export default router;
