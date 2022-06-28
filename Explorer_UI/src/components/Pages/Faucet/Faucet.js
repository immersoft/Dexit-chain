import {
    Alert,
    Box,
    Button,
    Card,
    CircularProgress,
    Grid,
    IconButton,
    Modal,
    Snackbar,
    TextField,
    Typography,
  } from "@mui/material";
  import LoadingButton from "@mui/lab/LoadingButton";
  import React, { useEffect, useState } from "react";
  import { ToastContainer, toast } from "react-toastify";
  import Connection from "../../../Faucet";
  import bigInt from "big-integer";
  import CloseIcon from "@mui/icons-material/Close";
  
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 450,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };
  
  const Faucet = () => {
    let [account, setAccount] = useState("");
    const [showloadingBtn, setshowloadingBtn] = useState(false);
    const[transferAddress,setTransferAddress]=useState('')

    // console.log(Connection)

    const getAccounts = async () => {
      try {
        account = await window.ethereum.selectedAddress;
        // console.log("account",account)
        setAccount(account);
      } catch (error) {
        console.log(error);
      }
    };
  
  
    try {
      window.ethereum.on("accountsChanged", function () {
        getAccounts();
      });
    } catch (error) {
      console.log(error);
    }
  
    useEffect(() => {
      getAccounts();
    }, [account]);
  
    const handleTransfer = async () => {
        setshowloadingBtn(true);
        try {
            const tx = await Connection.claimFaucet(transferAddress.toLowerCase());
            // const tx = await Connection.methods.claimFaucet(transferAddress).send({from:"7b2d011b4f2cfb367854ddb27ab022724c139a0132f5ba9a5026891221f92d9a"});
            // .transfer(transferAddress, "1000000000000000000")
            // .send({ from: account });
            let abc=await tx.wait();
            console.log(tx);
            if(abc){
            toast.success("Funded Successfully");
            setshowloadingBtn(false);
            }
        } catch (error) {
            toast.error("Error in transfer");
            console.log(error);
            setshowloadingBtn(false);
        }
    }
  
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
                DeXit Testnet Faucet
              </Typography>
              <Grid container sx={{mt:2}}>
              <Grid
                  item
                  xs={12}
                //   ml={3}
                //   mr={3}
                  sx={{ display: "flex", justifyContent: "space-between",alignItems:'center' }}
                >
                  <label
                    htmlFor="validatorAddress"
                    style={{ fontSize: "1.1rem",marginRight:10,alignItems:'center' }}
                  >
                    Address:
                  </label>
                  <TextField
                    fullWidth
                    id="outlined-basic"
                    variant="outlined"
                    label="Enter Address"
                    sx={{ my: 1 }}
                    value={transferAddress}
                    onChange={(e)=>setTransferAddress(e.target.value)}
                  />
                </Grid>
              </Grid>
  
              <div className="btn_postdetails" style={{ marginTop: "1rem" }}>
                {showloadingBtn === true ? (
                  <LoadingButton
                    sx={{
                      paddingLeft: "3.2rem",
                      paddingRight: "3.2rem",
                      border: "1px solid #0000ff !important",
                      mt:1
                    }}
                    color="error"
                    loading
                    variant="outlined"
                    size="medium"
                  >
                    Get 1 DXT
                  </LoadingButton>
                ) : (
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{ mt: 1 }}
                    size="medium"
                    onClick={() => handleTransfer()}
                  >
                    Get 1 DXT
                  </Button>
                )}
              </div>
            </Box>
          </Card>
        </div>
      </>
    );
  };
  
  export default Faucet;
  