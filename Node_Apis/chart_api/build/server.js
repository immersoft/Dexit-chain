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
exports.connection = void 0;
const express_1 = __importDefault(require("express"));
const typeorm_1 = require("typeorm");
const txHistoryCount_entity_1 = require("./txHistoryCount.entity");
const txRouter_1 = __importDefault(require("./txRouter"));
const txTable_1 = require("./txTable");
const cors = require('cors');
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(cors());
exports.connection = (0, typeorm_1.createConnection)({
    type: "postgres",
    host: "castor.db.elephantsql.com",
    port: 5432,
    username: "mrabouuj",
    password: "QvhCQM5jwdFFh7kHdzPW2nN2uI7fxNYS",
    database: "mrabouuj",
    entities: [txHistoryCount_entity_1.TransactionEntity, txTable_1.TransactionTable],
    synchronize: true,
    logging: false,
})
    .then((connection) => __awaiter(void 0, void 0, void 0, function* () {
    const repository = connection.getRepository(txHistoryCount_entity_1.TransactionEntity);
    console.log("Connection has been established successfully.");
}))
    .catch((err) => {
    console.error("Unable to connect to the database:", err);
});
app.get("/", function (req, res) {
    res.send("API running!");
});
app.use(txRouter_1.default);
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`server running at port:${port}`);
});
