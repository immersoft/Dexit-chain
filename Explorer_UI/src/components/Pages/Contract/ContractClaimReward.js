import {
  Box,
  Button,
  Card,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import SwapCallsIcon from "@mui/icons-material/SwapCalls";
import fromExponential from "from-exponential";
import Connection from "../../../Deposite";
import BscContract from "../../../Contract";
import bigInt from "big-integer";
import Web3 from "web3";
import Web3Token from "web3-token";
import axios from "axios";
import web3Object from "../../../utils";
import { ToastContainer, toast } from "react-toastify";
import rewardRegisterContract from "../../../AllContract/RewardRegisterContract";

const ContractClaimReward = () => {
  const [contractAddress, setContractAddress] = React.useState("");
  const [ownerAddress, setOwnerAddress] = React.useState("");
  let [account, setAccount] = useState("");
  const [claimBalance, setClaimBalance] = useState("0");

  const web3 = new Web3();
  web3.setProvider(window.ethereum);

  const getAccounts = async () => {
    if (typeof window !== undefined) {
      try {
        account = await window.ethereum.selectedAddress;
        // setAccount(account);
        console.log("printing account in get account : ", account);
      } catch (error) {
        // console.log(error);
      }
    }
  };

  if (typeof window !== undefined) {
  }

  useEffect(() => {
    getAccounts();
    getAbc();
  }, []);
  useEffect(() => {
    getClaimBalance();
    return () => {};
  }, [account]);

  const getClaimBalance = async () => {
    console.log("accc", rewardRegisterContract);
    console.log("accc", account);
    try {
      let balance = await rewardRegisterContract.rewardAmountOwner(account);
      console.log("bal", balance.toString());
      let formatToEther = web3.utils.fromWei(balance.toString());
      console.log("balance", formatToEther);
      setClaimBalance(formatToEther);
    } catch (error) {
      console.log(error);
    }
  };

  async function getAbc() {
    try {
      let web3 = new Web3(window.ethereum);
      let ch = await web3.eth.getAccounts();
      console.log("web3", ch);
      setAccount(ch[0]);
      setOwnerAddress(ch[0]);
      getClaimBalance();
    } catch (error) {}
  }

  const handleRegisterContract = async () => {
    console.log("handleRegisterContract", BscContract);

    try {
      let callMethod = await BscContract.claimOwnerReward();
      console.log("callmethod", callMethod);
      let waitForTransaction = await callMethod.wait();
      if (waitForTransaction) {
        console.log("transaction done", waitForTransaction);
        toast.success("Transaction Done");
        getClaimBalance();
      }
      console.log("check metjhod");
    } catch (error) {
      try {
        if (error.data) {
          toast.error(error.data.message);
        } else {
          toast.error("Execution reverted");
        }
      } catch (error) {
        console.log("error", error);
      }
    }
    // registerContract(account);
  };

  return (
    <>
      <ToastContainer />

      <div
        className="stack_modal"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Card sx={{ p: 2, boxShadow: "none", width: "700px" }}>
          <Box sx={{ flexGrow: 1, boxShadow: 3 }} p={3}>
            <Typography variant="h4" sx={{ textAlign: "center" }}>
              Claim Reward
            </Typography>

            <Grid container sx={{ mt: 2 }}>
              <Grid
                item
                xs={12}
                md={4}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Typography variant="h6" mt={2}>
                  Owner Address
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                md={8}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <TextField
                  id="outlined-basic"
                  variant="outlined"
                  value={ownerAddress ? ownerAddress : "Connect wallet"}
                  disabled
                  sx={{ color: "black !important" }}
                  // onChange={(e) => setOwnerAddress(e.target.value)}
                  fullWidth={true}
                />
              </Grid>
            </Grid>

            <Grid container sx={{ mt: 2 }}>
              <Grid
                item
                xs={12}
                md={4}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Typography variant="h6">Claim Balance</Typography>
              </Grid>
              <Grid
                item
                xs={12}
                md={8}
                sx={{ display: "flex", justifyContent: "center" }}
                pt="4"
                mt="4"
              >
                <Typography variant="h6" mt="5">
                  {claimBalance ? claimBalance : "0.000"} DXT
                </Typography>
              </Grid>
            </Grid>

            <Grid container sx={{ mt: 5 }}>
              <Grid
                item
                xs={12}
                md={12}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Button variant="contained" onClick={handleRegisterContract}>
                  Claim Reward
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </div>
    </>
  );
};

export default ContractClaimReward;
