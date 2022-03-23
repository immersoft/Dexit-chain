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
const { Client } = require('pg');
const router = express_1.default.Router();
router.get("/transactions", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const txRepo = (0, typeorm_1.getRepository)(txHistoryCount_entity_1.TransactionEntity);
        const transactions = yield txRepo.find();
        let ID = transactions.map((tx) => tx.id);
        res.json({ data: transactions });
        console.log(ID.length);
        let t = 0;
        t = t + 5;
        if (ID.length >= 15) {
            const we = txRepo.createQueryBuilder().delete()
                .from(txHistoryCount_entity_1.TransactionEntity)
                .where("id <= :id", { id: ID[14] })
                .execute();
        }
    });
});
const count = (0, index1_1.default)();
console.log(count,'final count wait for 3 hours')
setInterval(function () {
    (0, index1_1.default)();
}, 60000 * 60 * 3);

router.post("/tx", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(count, "inside post");
        let we = 2;
        const txRepo = (0, typeorm_1.getRepository)(txHistoryCount_entity_1.TransactionEntity);
        const tx = yield txRepo.create(req.body);
        const { tcount } = req.body;
        // await txRepo.insert({totalcount:count});
        // const results = await txRepo.save(tx);
        // return res.send(results);
    });
});
// router.put("/update:id", async function (req: Request, res: Response) {
//   const txRepo = getRepository(TransactionEntity);
//   const tx = await txRepo.create(req.body);
//   const { count , start } = req.body;
//    const results = await txRepo.update({id: 1}, {count:count,start:start});
//   return res.send(results);
// });
exports.default = router;
