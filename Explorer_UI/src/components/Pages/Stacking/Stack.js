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
import "./Stacking.css";
import { ToastContainer, toast } from "react-toastify";
import Connection from "../../../Contract";
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

const Stack = () => {
  const [openStack, setOpenStack] = React.useState(false);
  const [openUnStack, setOpenUnStack] = React.useState(false);
  const [stakerAddress, setStakerAddress] = useState("");
  const [stakerAmount, setStakerAmount] = useState();
  const [showloadingBtn, setshowloadingBtn] = useState(false);
  const [validatorName, setValidatorName] = useState("");
  const [validatorDescription, setValidatorDescription] = useState("");
  const [stakeamountWarning, setstakeamountWarning] = useState(false);
  const [dd, setdd] = useState([]);
  const handleOpenUnStack = () => setOpenUnStack(true);
  const handleCloseUnStack = () => setOpenUnStack(false);
  let [account, setAccount] = useState("");
  const [startLoading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const[website,setWebSite]=useState('')


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
      // console.log("eeeeffect")
    getAccounts();
    //   totalBalance()
  }, [account]);
  // console.log(account,"account")

  const getAmount = async (address) => {
    try {
      let result = await Connection.stakeValidatorBalance(address);
      let contact = await Connection.getContractBalance();
      let contractAmount = contact.toString();
      let amount = result.toString();
      const amountContract = contractAmount.slice(0, amount.length - 18);
      const totalamount = amount.slice(0, amount.length - 18);
      console.log(totalamount, "amount", amountContract);
      const resultData = (amountContract / totalamount) * 100;
      console.log(resultData, "resultData");
      return amount;
    } catch (error) {
      console.log(error);
    }
  };

  // const handleValidatorListDetails=(list)=>{
  //     if(list){
  //         return list.map(async(item,index)=>{
  //             return(
  //                 <>
  //                 {console.log(await getAmount(item[0]))}
  //                 {console.log(await Connection.stakeValidatorBalance(item[0]))}
  //                 {console.log(item[0],"item")}
  //                 </>
  //             )
  //         })
  //     }
  // }

  // const totalBalance=async()=>{
  //     let dataget=await Connection.stakeValidatorBalance(account)
  //     let alldetails=await Connection.getValidatorsDetails(1)
  //     console.log(dataget.toString(),"dataget")
  //     console.log(alldetails,"alldataget")
  // }

  const handleStakeSubmit = async () => {
    if (stakerAmount < 10 || !stakerAmount || validatorName =='' || validatorDescription=='' || website=='') {
      setstakeamountWarning(true);
      // buttons
      //   alert("Stake amount should be Greater than 10000");
      console.log("stake value");
      setOpen(true);
      //   setStakerAmount(0);
      return null;
    } else if (stakerAmount >= 10) {
      setshowloadingBtn(true);

      setstakeamountWarning(false);

      try {
        setLoading(true);
        let stakerAmountData = bigInt(stakerAmount * 10 ** 18);
        console.log(stakerAmountData.value, "stakerAmount");
        let result = await Connection.stakeValidator({
          value: stakerAmountData.value,
        });
        setOpenStack(false);
        console.log(result, "results");
        let abc = await result.wait();
        if (abc) {
          console.log(abc, "abc");
          setLoading(false);
          setOpenStack(false);
          postValidatorDetails()
          setStakerAmount()
          setValidatorName('')
          setValidatorDescription('')
          setWebSite('')
          toast.success("Transaction successfull");
        }
      } catch (error) {
        console.log(error);
        if (error.message) {
          toast.error(error.message);
        }
        setLoading(false);
        setOpenStack(false);
        setshowloadingBtn(false);
      }
    }
    setshowloadingBtn(false);
  };

  const shortenAccountId = (fullStr) => {
    const strLen = 20;
    const separator = "...";

    if (fullStr?.length <= strLen) return fullStr;

    const sepLen = separator.length;
    const charsToShow = strLen - sepLen;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);
// console.log("return  ",fullStr?.substr(0, frontChars) +
// separator +
// fullStr?.substr(fullStr?.length - backChars))
    return (
      fullStr?.substr(0, frontChars) +
      separator +
      fullStr?.substr(fullStr?.length - backChars)
    );
  };

  const postValidatorDetails=()=>{
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
    var raw = JSON.stringify({
      "Name": validatorName,
      "Address": account,
      "Description": validatorDescription,
      "Website": website
    });
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    
    fetch("https://final-explorer.herokuapp.com/validatorInfo", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
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
              Staking
            </Typography>
            <div className="text_input">
                {/* {console.log("accccccccc---",account)} */}
              <TextField
                id="outlined-basic"
                label="Staker Address"
                variant="outlined"
                sx={{ mt: 1 }}
                defaultValue={account ? shortenAccountId(account) : "loading"}

                value={account ? shortenAccountId(account) : "loading"}
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                id="outlined-basic"
                required
                label="Staker Amount"
                variant="outlined"
                sx={{ mt: 1 }}
                value={stakerAmount}
                error={stakeamountWarning}
                onChange={(e) => setStakerAmount(e.target.value)}
                helperText="Minimum Stake Amount 10000"
              />
              <TextField
                id="outlined-basic"
                required
                label="Validator Name"
                variant="outlined"
                sx={{ mt: 1 }}
                value={validatorName}
                error={stakeamountWarning}
                onChange={(e) => setValidatorName(e.target.value)}
              />
              <TextField
                id="outlined-basic"
                required
                label="Validator Description"
                variant="outlined"
                sx={{ mt: 1 }}
                value={validatorDescription}
                error={stakeamountWarning}

                onChange={(e) => setValidatorDescription(e.target.value)}
              />
              <TextField
                id="outlined-basic"
                required
                label="Website"
                variant="outlined"
                sx={{ mt: 1 }}
                value={website}
                error={stakeamountWarning}

                onChange={(e)=>setWebSite(e.target.value)}
              />
            </div>

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
                  Submit
                </LoadingButton>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 1 }}
                  size="medium"
                  onClick={() => handleStakeSubmit()}
                >
                  Submit
                </Button>
              )}
            </div>
          </Box>
        </Card>
      </div>
    </>
  );
};

export default Stack;
