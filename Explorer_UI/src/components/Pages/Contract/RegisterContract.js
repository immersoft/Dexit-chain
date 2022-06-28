import { Box, Button, Card, Grid, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { ToastContainer, toast } from "react-toastify";
import RewardRegisterContract from "../../../AllContract/RewardRegisterContract";

const RegisterContract = () => {
  const [contractAddress, setContractAddress] = React.useState("");
  const [ownerAddress, setOwnerAddress] = React.useState("");
  let [account, setAccount] = useState("");
  const [btnDisable, setBtnDisable] = useState(false);

  const web3 = new Web3();
  // web3.setProvider("https://datafeed.dexit.network");
  const getAccounts = async () => {
    try {
      account = await window.ethereum.selectedAddress;
      // setAccount(account);
      console.log("printing account in get account : ", account);
    } catch (error) {
      console.log(error);
    }
  };

  const Init = () => {
    try {
      if (typeof window !== undefined) {
        window.ethereum.on("accountsChanged", function () {
          getAccounts();
        });
      }
    } catch (error) {
      console.log("e", error);
    }
  };

  useEffect(() => {
    Init();

    getAccounts();
    getAbc();
  }, []);

  async function getAbc() {
    try {
      let web3 = new Web3(window.ethereum);

      let ch = await web3.eth.getAccounts();
      console.log("web3", ch);
      setAccount(ch[0]);
    } catch (error) {
      console.log("er", error);
    }
  }

  const handleRegisterContract = async () => {
    console.log("handleRegisterContract");
    setBtnDisable(true)

    try {
      let contract = await RewardRegisterContract.registerContract(
        contractAddress,
        ownerAddress
      );
      console.log("contract", contract);
      let waitForTx = await contract.wait();
      if (waitForTx) {
        toast.success("transaction success");
      }
    setBtnDisable(false)

    } catch (error) {
      console.log("error", error.data.message);
      if (error.data.message) {
        toast.error(error.data.message);

      } else {
        toast.error("Execution reverted");
      }
    setBtnDisable(false)

    }
    setBtnDisable(false)

  };

  return (
    <>
      <ToastContainer />

      <div
        className="stack_modal"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Card sx={{ p: 2, boxShadow: "none", width: "600px" }}>
          <Box sx={{ flexGrow: 1, boxShadow: 3 }} p={3}>
            <Typography variant="h4" sx={{ textAlign: "center" }}>
              Register Contract
            </Typography>
            <Grid container sx={{ mt: 5 }}>
              <Grid
                item
                xs={6}
                md={6}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Typography variant="h6">Contract address </Typography>
              </Grid>
              <Grid
                item
                xs={6}
                md={6}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <TextField
                  id="outlined-basic"
                  label="Enter Contract Address"
                  variant="outlined"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                />
              </Grid>
            </Grid>

            <Grid container sx={{ mt: 2 }}>
              <Grid
                item
                xs={6}
                md={6}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Typography variant="h6" mt={2}>
                  Owner Address
                </Typography>
              </Grid>
              <Grid
                item
                xs={6}
                md={6}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <TextField
                  id="outlined-basic"
                  label={"Enter Owner Address"}
                  variant="outlined"
                  value={ownerAddress}
                  onChange={(e) => setOwnerAddress(e.target.value)}
                />
              </Grid>
            </Grid>

            <Grid container sx={{ mt: 5 }}>
              <Grid
                xs={12}
                md={12}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                {btnDisable === true ? (
                  <Button
                    variant="contained"
                    disabled
                    onClick={handleRegisterContract}
                  >
                    Register Contract
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleRegisterContract}>
                    Register Contract
                  </Button>
                )}
              </Grid>
            </Grid>
          </Box>
        </Card>
      </div>
    </>
  );
};

export default RegisterContract;
