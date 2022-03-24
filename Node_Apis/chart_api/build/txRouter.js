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
// import searchTransactionByBlock from "./index1";
const txHistoryCount_entity_1 = require("./txHistoryCount.entity");
const { Client } = require('pg');
const router = express_1.default.Router();
router.get("/validatorInfo/:address", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const txRepo = (0, typeorm_1.getRepository)(txHistoryCount_entity_1.TransactionEntity);
        const transactions = yield txRepo.findOne({ Address: req.params.address });
        res.json({ data: transactions });
    });
});
router.post("/validatorInfo", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const txRepo = (0, typeorm_1.getRepository)(txHistoryCount_entity_1.TransactionEntity);
        const tx = yield txRepo.create(req.body);
        // await txRepo.insert({totalcount:count});
        const results = yield txRepo.save(tx);
        return res.send(results);
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
