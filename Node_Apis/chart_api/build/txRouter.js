"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const txChart_entity_1 = require("./txChart.entity");
const txTransactionCount_entity_1 = require("./txTransactionCount.entity");
const Swap = __importStar(require("./swap/swap"));
const bigInt = require("big-integer");
const { Client } = require('pg');
const router = express_1.default.Router();
console.log(Swap);
router.get("/validatorInfo/:address", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const txRepo = (0, typeorm_1.getRepository)(txHistoryCount_entity_1.TransactionEntity);
        const transactions = yield txRepo.findOne({ Address: req.params.address });
        res.json({ data: transactions });
    });
});
router.get("/transactions", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const txRepo = (0, typeorm_1.getRepository)(txChart_entity_1.TransactionTimesEntity);
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
        const txRepo = (0, typeorm_1.getRepository)(txChart_entity_1.TransactionTimesEntity);
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
/*********************Swap Router*************************/
router.post("/withdraw/ETH", function (req, res) {
    var key1 = req.body.from;
    var key2 = bigInt(req.body.amount);
    var key3 = req.body.exc_rate;
    var key4 = req.body.transactionHash;
    const result = Swap.claimETH(key1, key2.value, key3, key4);
    res.send(result);
});
router.post("/withdraw/BSC", function (req, res) {
    var key1 = req.body.from;
    var key2 = bigInt(req.body.amount);
    var key3 = req.body.exc_rate;
    var key4 = req.body.transactionHash;
    const result = Swap.claimBSC(key1, key2.value, key3, key4);
    res.send(result);
});
router.post("/withdraw/DXT", function (req, res) {
    var key1 = req.body.from;
    var key2 = bigInt(req.body.amount);
    var key3 = req.body.exc_rate;
    var key4 = req.body.transactionHash;
    const result = Swap.claimDXT(key1, key2.value, key3, key4);
    res.send(result);
});
exports.default = router;
