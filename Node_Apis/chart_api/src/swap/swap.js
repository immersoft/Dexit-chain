const express = require("express");
const app = express();
const cors = require("cors");
const Web3 = require("web3");
const Swap = require("./swapContract");
const Swap_ADDRESS = require("./swapContract");
const Provider = require("@truffle/hdwallet-provider");
const { ethers } = require("ethers");
const bigInt = require ("big-integer");
const privateKey ='';
const provider = new Provider(privateKey, "https://testnet.dexit.network");
const web3 = new Web3(provider);
app.use(express.json());


app.use(cors())
// const deposit = async () => {
//   try {
//     const accounts = await web3.eth.getAccounts();
//     const Swapobj = new web3.eth.Contract(
//       Swap.ETHswap_ABI,
//       Swap.ETHswap_ADDRESS
//     );
//     let result = await Swapobj.methods.deposit().send({
//       from: accounts[0],
//       value: 100,
//     });
//     console.log("result ", result);
//   } catch (error) {
//     console.log(error);
//   }
// };
// account,amount
const withdraw = async (account,amount) => {
  try {
    const accounts = await web3.eth.getAccounts();
    const Swapobj = new web3.eth.Contract(
      Swap.ETHswap_ABI,
      Swap.ETHswap_ADDRESS
    );
    // let owner =await Swapobj.methods._owner().call()
    let result = await Swapobj.methods.withdraw(account,amount).send({
        from : accounts[0]
    });
    console.log("result ", result);
  } catch (error) {
    console.log(error);
  }
};

const port = process.env.PORT || 5000;

// withdraw(myadd,amount);

app.post("/withdraw", function (req,res) {
  var key1 = req.body.myadd;
  var key2 = bigInt(req.body.amount);
  withdraw(key1, key2.value);
  res.send("API running!");
});

app.get("/demo", function (req, res) {
  res.send("API 2 running!");
});

app.listen(port, () => {
  console.log(`server running at port:${port}`);
});
