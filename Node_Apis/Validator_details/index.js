const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { MONGOURI } = require("./key");
const myParser = require("body-parser");

const app = express();

app.use(cors());

mongoose.connect(MONGOURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Connected With MongoDb");
});

mongoose.connection.on("error", (err) => {
  console.log("Error in Connection", err);
});

app.use(express.json());
require("./modal/validatorInfo");

app.use("/auth", require("./auth/auth"));

app.listen(5000, () => {
  console.log("Server is started");
});
