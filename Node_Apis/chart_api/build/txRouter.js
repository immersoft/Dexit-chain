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
const express_1 = __importDefault(require("express"));
const typeorm_1 = require("typeorm");
const index1_1 = __importDefault(require("./index1"));
const txHistoryCount_entity_1 = require("./txHistoryCount.entity");
const txTransactionCount_entity_1 = require("./txTransactionCount.entity");
const txTable_1 = require("./txTable");
const router = express_1.default.Router();
const solc = require('solc');
const fs = require('fs');
let DirName = './src/contract/';
let DirName2 = './build/contract/';
var qs = require('querystring');
var formidable = require('formidable');
var util = require("util");
const path = require('path');
router.get("/validatorInfo/:address", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const txRepo = (0, typeorm_1.getRepository)(txHistoryCount_entity_1.TransactionEntity);
        const transactions = yield txRepo.findOne({ Address: req.params.address });
        res.json({ data: transactions });
    });
});
router.get("/transactions", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const txRepo = (0, typeorm_1.getRepository)(txTable_1.TransactionTableCounter);
        const transactions = yield txRepo.find();
        let ID = transactions.map((tx) => tx.id);
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
});
const count = (0, index1_1.default)();
console.log(count, 'final count wait for 24 hours');
setInterval(function () {
    (0, index1_1.default)();
    console.log("function");
}, 60000 * 60 * 3);
router.post("/tx", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(count, "inside post");
        const txRepo = (0, typeorm_1.getRepository)(txTable_1.TransactionTableCounter);
        const tx = yield txRepo.create(req.body);
        const { tcount } = req.body;
        yield txRepo.insert({ totalcount: yield count });
        const results = yield txRepo.save(tx);
        return res.send(results);
    });
});
router.post("/validatorInfo", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const txRepo = (0, typeorm_1.getRepository)(txHistoryCount_entity_1.TransactionEntity);
        const get = yield txRepo.findOne({ Address: req.body.Address });
        if (get) {
            res.json({ data: "Already Exist" });
        }
        else {
            const tx = yield txRepo.create(req.body);
            const results = yield txRepo.save(tx);
            return res.send(results);
        }
    });
});
router.get("/blockstransactions", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const txRepo = (0, typeorm_1.getRepository)(txTransactionCount_entity_1.BlockTransactionEntity);
        const transactions = yield txRepo.find();
        // console.log("hi")
        res.json({ data: transactions });
    });
});
router.post("/blockstransactioncount", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const txRepo = (0, typeorm_1.getRepository)(txTransactionCount_entity_1.BlockTransactionEntity);
        const tx = yield txRepo.create(req.body);
        const results = yield txRepo.save(tx);
        return res.send(results);
    });
});
router.post('/transactioncountupdate/:id', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const txRepo = (0, typeorm_1.getRepository)(txTransactionCount_entity_1.BlockTransactionEntity);
            // console.log(req.body,"body data")
            const tx = yield txRepo.create(req.body);
            const { count, start } = req.body;
            const results = yield txRepo.update({ id: 1 }, { count: count, start: start });
            return res.send(results);
        }
        catch (error) {
            console.log(error);
        }
    });
});
router.post("/deploy", function (req, res) {
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
            console.log(body, "body");
            var post = qs.parse(body);
            //   fs.writeFileSync(`${DirName}demo.sol`, post.toString(), (err:any) => {
            //     if (err) {
            //         throw err;
            //     }
            // });
            code = post.code;
            console.log(post, "klklklkl");
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
const writeFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        fs.writeFile(`${DirName2}Demo.sol`, fields.code, (err) => {
            if (err) {
                throw err;
            }
        });
    });
});
// router.post("/writeFile",writeFile);
router.post("/upload", function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        // `file` is the name of the <input> field of type `file`
        console.log(files, "1st");
        console.log(fields, "2nd");
        console.log(fields.code, "3nd");
        //  console.log(solc.compile(fields.code, 1).contracts[":Lottery"])
        console.log(solc.compile(fields.code, 1));
        const result = solc.compile(fields.code, 1).contracts;
        // console.log(fields.code.splice(14),"4nd");
        // console.log(typeof(result),"typeoff")
        // console.log(solc.compile(post.data,1))
        // if(result){
        console.log(Object.keys(result), "object data");
        res.writeHead(200, { 'content-type': 'text/plain' });
        // res.write('received upload:\n\n');
        res.end(util.inspect({ fields: result }));
        // }
        // res.json({data:final})
        // res.json({ data: result });
        // return result
    });
    form.on('error', function (err) {
        console.error(err);
    });
    form.on('progress', function (bytesReceived, bytesExpected) {
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
router.post("/writeFile", function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        fs.writeFile(`${DirName2}Demo.sol`, fields.code, (err) => {
            if (err) {
                throw err;
            }
        });
        return res.send(fields.code);
    });
});
router.post("/newversion", function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        // fs.writeFile(`${DirName2}Demo.sol`,fields.code , (err:any) => {
        //       if (err) {
        //           throw err;
        //       }
        // });
        try {
            const bettingPath = path.resolve(__dirname, 'contract', 'Demo.sol');
            console.log(bettingPath, "second");
            const source = fs.readFileSync(bettingPath, 'utf-8');
            console.log(source, "third");
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
            console.log(input, "output");
            var output = JSON.parse(solc.compile(JSON.stringify(input)));
            ;
            console.log(output, "output");
            const LotteryContract = output.contracts['Demo.sol'];
            console.log(LotteryContract, "contract");
            const result = Object.keys(LotteryContract)[0];
            res.json({ data: LotteryContract });
            // res.json({ data2: LotteryContract });
        }
        catch (error) {
            console.log(error);
        }
        // const result = solc.compile(fields.code,1).contracts
        // console.log(Object.keys(result),"object data")
        // res.writeHead(200, {'content-type': 'text/plain'});
        // res.end(util.inspect({fields: result}));
    });
    form.on('error', function (err) {
        console.error(err);
    });
    form.on('progress', function (bytesReceived, bytesExpected) {
        var percent_complete = (bytesReceived / bytesExpected) * 100;
        console.log(percent_complete.toFixed(2));
    });
});
exports.default = router;
