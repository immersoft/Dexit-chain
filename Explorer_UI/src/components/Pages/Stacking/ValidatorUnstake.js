import React, { useState, useEffect, Suspense } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Backdrop from '@mui/material/Backdrop';
import {
  Button,
  Box,
  Card,
  Typography,
  Modal,
  FormControl,
  OutlinedInput,
  FormHelperText,
  Alert,
  CircularProgress,
  Fade,
  TextField,
  Tooltip,
} from "@mui/material";
// import { Box } from "@mui/system";
import Connection from "../../../Contract";
import moment from "moment";
import bigInt from "big-integer";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import DelegatorDetails from "../Delegator/DelegatorDetails";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import loader from "../../../Image/graphics-07.gif";
import { toast, ToastContainer } from "react-toastify";
import InfoIcon from '@mui/icons-material/Info';
import fromExponential from 'from-exponential';
import DelegatorUnstak from "./DelegatorUnstak";


const columns = [
  // { id: "id", label: "UniqueId", minWidth: 20 },
  // { id: "start", label: "Start Time", minWidth: 20 },
  { id: "address", label: "Address", minWidth: 50 },
  { id: "vaddress", label: "Validator Address", minWidth: 50 },
  { id: "status", label: "Status", minWidth: 50 },
  { id: "amount", label: "Amount", minWidth: 50 },
  { id: "totalamount", label: "Total Amount", minWidth: 50 },
  { id: "unstake", label: "Un-Stake", minWidth: 50 },
  { id: "withdrawl", label: "Withdraw", minWidth: 50 },
  { id: "income", label: "Income", minWidth: 50 },
  { id: "totalIncome", label: "Total Income", minWidth: 50 },
  { id: "Claim", label: "Claim", minWidth: 50 },
];

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 450,
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const ValidatorUnstake = () => {
  let customList = [];
  let [account, setAccount] = useState("");
  const [stackedAmountData, setStackedAmountData] = useState();
  const [openUnStack, setOpenUnStack] = React.useState(false);
  const [dd, setDD] = useState();
  const [listData, setListData] = useState(true);
  const [value, setValue] = React.useState(0);
  const [withdrawl, setWithdrawl] = useState(false);
  const [open, setOpen] = React.useState(true);
  const [withdrawTimeOut, setWithdrawTimeOut] = useState(60);
  const [withdrawTimeOutStatus, setWithdrawTimeOutStatus] = useState(false);
  const [unstakeDelegateError, setUnstakeDelegateError] = useState();

  const [deUnstake, setDeUnstake] = useState(false);
  const [loading, setLoading] = useState(false);
  const[claimLoader,setClaimLoader]=useState(false)
  const [modalOpen, setModalOpen] = React.useState(false);
  const[withdrawModal,setWithdrawModal]=useState(false)
  const[withdrawAmount,setWithdrawAmount]=useState(0)
  const[delegateWithdrawModal,setDelegateWithdrawModal]=useState(false)
  const [ValidatorAddForDel,setValidatorAddForDel]=useState()
  const[popupBalance,setpopupBalance]=useState()
  const[delegateBalance,setDelegateBalance]=useState()
  const[isLength,setIsLength]=useState(false)

  const handleDelegateWithdrawModal=(validatorAddress,amount)=>{
    setValidatorAddForDel(validatorAddress)
    setDelegateBalance(amount)
    setDelegateWithdrawModal(true)
  }

  const handleDelegateWithdrawModalClose=()=>{
    setWithdrawAmount(0)
    setDelegateWithdrawModal(false)
  }

  const handleWithdrawModal=(balance)=>{
    setpopupBalance(balance)
    setWithdrawModal(true)
  
  }

  const handleDelegateWithdrawMaxAmount=()=>{
    setWithdrawAmount(delegateBalance/1000000000000000000)
  }

  const handleWithdrawMaxAmount=()=>{
    setWithdrawAmount(popupBalance/1000000000000000000)
  }

  const handleWithdrawModalClose=()=>{
    setWithdrawAmount(0)
    setWithdrawModal(false)
  }

  const handleModalOpen = () => {
    setModalOpen(true)
  };
  const handleModalClose = () => setModalOpen(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  async function getBalanceData() {
    try {
      let list = await Connection.getCurrentValidators();
      handleValidatorListDetails(list);
    } catch (error) {
      console.log(error);
    }
  }

  const getAccounts = async () => {
    try {
      account = await window.ethereum.selectedAddress;
      setAccount(account);
    } catch (error) {
      console.log(error);
    }
  };

  window.ethereum.on("accountsChanged", function () {
    getAccounts();
  });

  useEffect(() => {
    getAccounts();
  }, [listData]);

  const getAmount = async (address) => {
    try {
      console.log(address, ":address");
      let result = await Connection.stakeValidatorBalance(address);
      let amount = await result.toString();
      // console.log(result,"amount")
      return amount;
    } catch (error) {
      console.log(error);
    }
  };

  const handleValidatorListDetails = async (list) => {
    try {
      if (list) {
        for (let i = 0; i < list.length; i++) {
          let dataget = await Connection.getValidatorInfo(list[i]);
           if (dataget[6].length >=0) {
            if (dataget[0].toLowerCase() === account) {
              let customObject = {
                address: dataget[0],
                amount: dataget[2].toString(),
                totalAmount: dataget[3].toString() ,
                status:dataget[1],
                income:dataget[4].toString(),
                totalIncome:dataget[5].toString()
              };
              let check = customList.find(
                (item) => item.address.toLowerCase() === account
              );
                if (check == undefined) {
                customList.push(customObject);
                setIsLength(true)
                }
            }
          }
        }
      }
      setDD(customList);
      setListData(!listData);
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    getBalanceData();
  }, [account]);

  const handleCloseUnStack = () => setOpenUnStack(false);

  const unStackAmount = (data) => {
    console.log(data, "data");
    setStackedAmountData(data);
    setOpenUnStack(true);
  };

  React.useEffect(() => {
    if (withdrawTimeOutStatus === true) {
      withdrawTimeOut > 0 &&
        setTimeout(() => setWithdrawTimeOut(withdrawTimeOut - 1), 1000);
    }
  }, [withdrawTimeOutStatus, withdrawTimeOut]);

  const handleunStake = async () => {
    try {
      // let stakerAmountData2 = bigInt(unStackPrice * 10 ** 18);
      setLoading(true);
      let result = await Connection.unstakeValidator();
      console.log(result, "unstake");
      let stakingResult = await Connection.getStakingInfo(account, account);
      console.log(stakingResult, "stakingResult");
      let abc = await result.wait();
      if (abc) {
        setWithdrawTimeOutStatus(true);
        setWithdrawl(true);
        setLoading(false);
        toast.success("Un-Stake successfull");
        getBalanceData()

      }
    } catch (error) {
      setLoading(false);

      console.log("errrrr", error);
      if (error.code ===4001) {
        toast.error(error.message.split(":").pop());
      } else if (error.data.message) {
        setUnstakeDelegateError(error);
        toast.error(error.data.message.split(":").pop());
      }
    }

  };

  const handleWithdraw = async () => {
    try {
      handleWithdrawModalClose()
      setLoading(true);
      let ethe=bigInt(withdrawAmount*10**18)
      let result = await Connection.withdrawValidatorStaking(ethe.value);
      let abc = await result.wait();
      if (abc) {
        setLoading(false);
        window.location.reload();
      }
      console.log(result);
    } catch (error) {
      console.log(error);
      handleWithdrawModalClose()

      setLoading(false);
      if (error.code ===4001) {
        toast.error(error.message);
      }
     else if (error.data.message.split(":").pop()) {
        toast.error(error.data.message.split(":").pop());
      }
    }
  };

  const delegateUnstake = async (validAddress, index) => {
    try {
      setLoading(true);

      let delegateUnstake = await Connection.unstakeDelegators(validAddress);
      let abc = await delegateUnstake.wait();
      if (abc) {
        setLoading(false);
        toast.success("Delegate Un-Stake successfull");
      }

      // let abc = await delegateUnstake.wait();
    } catch (error) {
      console.log("der",error);
      setLoading(false);
      if (error.code===4001) {
        toast.error(error.message.split(":").pop());
      }
       else if (error.data) {
         console.log("Errorrrrrr---",error.data.message.split(":").pop())
         toast.error(error.data.message);
        // setDeUnstakeError(error);
        setDeUnstake(true);
      }
    }
  };

  const delegateWithDraw = async () => {
    try {
      handleDelegateWithdrawModalClose()
      setLoading(true);
      let amountWithdraw=bigInt(withdrawAmount * 10 ** 18);
      console.log(amountWithdraw.value,"amountWithdraw")
      let delegateWithdrwal = await Connection.withdrawDelegatorStaking(
        ValidatorAddForDel,amountWithdraw.value
      );
      let abc = await delegateWithdrwal.wait();
      if (abc) {
        setLoading(false);
        toast.success("Withdraw successfull")
        window.location.reload();

        getBalanceData()
      }
      console.log(delegateWithdrwal, "delegateWithdrwal");
    } catch (error) {
      handleDelegateWithdrawModalClose()
      setLoading(false);
      console.log(error)
      if(error.code ===4001){
        console.log("if")
        toast.error(error.message.split(":").pop());
      }
      else if (error.data.message) {
        console.log("else if")

        toast.error(error.data.message.split(":").pop());
      }


    }
  };


  const handleClaim=async()=>{
    try {
      setLoading(true)
      const claimButton=await Connection.claimValidatorReward()
      let abc = await claimButton.wait();
      if (abc) {
        setLoading(false);
        toast.success("Claim successfull")
        window.location.reload();

      }
    } 
    catch (error) {
      setLoading(false);
      toast.error(error.data.message.split(":").pop());
      console.log(error)
    } 
  }

  const delegateClaim=async(account)=>{
    try {
      setLoading(true)
      const delegateClaim=await Connection.claimDelegatorReward(account)
      let abc = await delegateClaim.wait();
      if (abc) {
        setLoading(false);
        toast.success("Claim successfull")
        window.location.reload();

      }
    } catch (error) {
      setLoading(false);
      toast.error(error.data.message);
      console.log(error)
    }
  }


const handleJailed=async()=>{
  try {
    handleModalClose()
    setLoading(true)
    let ethe=bigInt(1*10 ** 18)
    let unjailing=await Connection.unJailed({value:ethe.value})
    console.log(unjailing,"unjailing")
    let abc = await unjailing.wait();
    if(abc){
      setLoading(false);
      window.location.reload();
      toast.success("Unjail successfull")
    }
  } catch (error) {
    setLoading(false);
    toast.error(error.data.message);
  }
}


const shortenAccountId = (fullStr) => {
  const strLen = 30;
  const separator = "....";

  if (fullStr?.length <= strLen) return fullStr;

  const sepLen = separator.length;
  const charsToShow = strLen - sepLen;
  const frontChars = Math.ceil(charsToShow / 3);
  const backChars = Math.floor(charsToShow / 3);

  return (
    fullStr?.substr(0, frontChars) +
    separator +
    fullStr?.substr(fullStr?.length - backChars)
  );
};
  return (
    <>
      <ToastContainer  />
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={modalOpen}
        onClose={handleModalClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={modalOpen}>
          <Box sx={style}>
            <Typography variant="h4" sx={{textAlign:"center",fontWeight:"700"}}>Unjail</Typography>
            <div style={{display:"flex",justifyContent:"space-evenly",alignItems:"center",marginTop:"1rem"}}>
                <TextField
              id="outlined-read-only-input"
              label="Amount"
              defaultValue="1 DXT"
              InputProps={{
                readOnly: true,
              }}
              size="medium"
            />

            <Button variant="outlined" onClick={()=>handleJailed()}>Unjail</Button>
            </div>
          </Box>
        </Fade>
      </Modal>
    </div>

    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={withdrawModal}
        onClose={handleWithdrawModalClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={withdrawModal}>
          <Box sx={style}>
            <Typography variant="h4" sx={{textAlign:"center",fontWeight:"700"}}>Withdraw Amount</Typography>
            <div style={{display:"flex",justifyContent:"center",alignItems:"center",marginTop:"1rem"}}>
              <TextField
            required
            id="outlined-required"
            label="Amount"
            value={withdrawAmount}
            onChange={(e)=>setWithdrawAmount(e.target.value)}
            InputProps={{endAdornment: <Button variant="contained" onClick={()=>handleWithdrawMaxAmount()}>Max</Button>}}
          
          />
            </div>
            <div style={{display:"flex",justifyContent:"center",alignItems:"center",marginTop:"1rem"}}>
            {/* <Button variant="outlined" onClick={()=>handleWithdrawMaxAmount()}>Max</Button> */}
            <Button variant="outlined" onClick={()=>handleWithdraw()}>Confirm</Button>
            </div>
          </Box>
        </Fade>
      </Modal>
    </div>

    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={delegateWithdrawModal}
        onClose={handleDelegateWithdrawModalClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={delegateWithdrawModal}>
          <Box sx={style}>
            <Typography variant="h4" sx={{textAlign:"center",fontWeight:"700"}}>Withdraw Amount</Typography>
            <div style={{display:"flex",justifyContent:"center",alignItems:"center",marginTop:"1rem"}}>
              <TextField
            required
            id="outlined-required"
            label="Amount"
            value={withdrawAmount}
            onChange={(e)=>setWithdrawAmount(e.target.value)}
            InputProps={{endAdornment: <Button variant="contained" onClick={()=>handleDelegateWithdrawMaxAmount()}>Max</Button>}}
          />
            </div>

            <div style={{display:"flex",justifyContent:"center",alignItems:"center",marginTop:"1rem"}}>
              {/* <Button variant="outlined" onClick={()=>handleDelegateWithdrawMaxAmount()}>Max</Button> */}
              <Button variant="outlined" onClick={()=>delegateWithDraw()}>Confirm</Button>
            </div>
          </Box>
        </Fade>
      </Modal>
    </div>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", padding: "10%" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              textAlign: "center",
            }}
          >
            <img src={loader} width={250} height={120} />
            {/* <CircularProgress variant="determinate" value={progress} size={70} sx={{textAlign:"center"}}/> */}
            <span
              style={{ fontSize: "1.2rem", lineHeight: "0", color: "grey" }}
            >
              Please Wait...
            </span>
          </div>
        </Box>
      ) : (
        <>
          <div className="validator_container">
            {dd ? (
              <Card
                sx={{
                  display: "flex",
                  p: 2,
                  flexDirection: "column",
                  boxShadow: "none !important",
                  background: "#F8FAFD",
                }}
              >
                  <Box sx={{ flexGrow: 1, mt: 2 }}>
                    <TableContainer component={Paper}>
                    {dd.length>0 ?
                    <Table
                      sx={{ minWidth: 650, p: 1 }}
                      aria-label="simple table"
                    >
                        { 
                            dd.map((item,index)=>{
                                    return(
                                        <>
                                       {
                                           item.address &&
                                           (
                                               <>
                                               
                                               {
                                                   item.address.toLowerCase()===account && item.amount!=0 && item.totalAmount !=undefined ?(
                                                      
                                                    <>
                                                    <TableHead>
                                                      <TableRow
                                                        className="heading_table"
                                                        sx={{ background: "#F8FAFD" }}
                                                      >
                                                         <TableCell
                                                            
                                                            style={{ top: 57, minWidth: 50,alignItems:"center" }}
                                                          >
                                                            Address
                                                          </TableCell>


                                                          <TableCell
                                                            
                                                            style={{ top: 57, minWidth: 50,alignItems:"center" }}
                                                          >
                                                            Status
                                                          </TableCell>

                                                          <TableCell
                                                            
                                                            style={{ top: 57, minWidth: 50,alignItems:"center" }}
                                                          >
                                                            
                                                            <div style={{display:"flex"}}>
                                                              Amount
                                                              <Tooltip title="Info">
                                                                <InfoIcon/>
                                                              </Tooltip>
                                                            </div>
                                                          </TableCell>

                                                          <TableCell
                                                            
                                                            style={{ top: 57, minWidth: 50,alignItems:"center" }}
                                                          >
                                                            <div style={{display:"flex"}}>
                                                              Total Amount
                                                              <Tooltip title="Info">
                                                                <InfoIcon/>
                                                              </Tooltip>
                                                            </div>
                                                            
                                                          </TableCell>

                                                          <TableCell
                                                            
                                                            style={{ top: 57, minWidth: 50,alignItems:"center" }}
                                                          >
                                                            Un-Stake
                                                          </TableCell>

                                                          <TableCell
                                                           
                                                            style={{ top: 57, minWidth: 50,alignItems:"center" }}
                                                          >
                                                            Withdraw
                                                          </TableCell>

                                                          <TableCell
                                                            
                                                            style={{ top: 57, minWidth: 50,alignItems:"center" }}
                                                          >
                                                            <div style={{display:"flex"}}>
                                                              Income
                                                              <Tooltip title="Info">
                                                                <InfoIcon/>
                                                              </Tooltip>
                                                            </div>
                                                          </TableCell>

                                                          <TableCell
                                                           
                                                            style={{ top: 57, minWidth: 50,alignItems:"center" }}
                                                          >
                                                            
                                                            <div style={{display:"flex"}}>
                                                              Total Income
                                                              <Tooltip title="Info">
                                                                <InfoIcon/>
                                                              </Tooltip>
                                                            </div>
                                                          </TableCell>

                                                          <TableCell
                                                            
                                                            style={{ top: 57, minWidth: 50,alignItems:"center" }}
                                                          >
                                                            Claim
                                                          </TableCell>
                                                      </TableRow>
                                                    </TableHead>
                                                      <TableBody>
                                                      <TableRow
                                                        key={index}
                                                        sx={{
                                                            "&:last-child td, &:last-child th":
                                                            { border: 0 },
                                                        }}
                                                        >
                                              <TableCell
                                                component="th"
                                                scope="row"
                                              >
                                                {shortenAccountId(item.address)}
                                              </TableCell>

                                              {/* <TableCell
                                                component="th"
                                                scope="row"
                                              >
                                                {item.validatorAddress
                                                  ? shortenAccountId(item.validatorAddress)
                                                  : "-"}
                                              </TableCell> */}

                                              <TableCell>
                                                {item ? item.status==2 ? <span style={{color:"orange",textTransform:"uppercase"}}>Staked</span>:item.status==3?<span style={{color:"orange",textTransform:"uppercase"}}>Un-Staked</span>:item.status==4 ? <Button variant="contained" color="error" onClick={()=>handleModalOpen()}>Jailed</Button>:item.status==1?<span style={{color:"orange",textTransform:"uppercase"}}>Created</span>:item.status==0? <span style={{color:"orange",textTransform:"uppercase"}}>Not Exist</span> :"-" : "-"}
                                              </TableCell>

                                              <TableCell>
                                                {item ? item.amount/1000000000000000000 : "-"}
                                              </TableCell>

                                              <TableCell>
                                                {item ? item.totalAmount/1000000000000000000 : "-"}
                                              </TableCell>
                                              

                                                  <TableCell>
                                                    <Button
                                                      variant="outlined"
                                                      success
                                                      onClick={() =>
                                                        handleunStake()
                                                      }
                                                    >
                                                      Un-Stake
                                                    </Button>
                                                    
                                                  </TableCell>

                                                  <TableCell>
                                                    <Button
                                                      variant="outlined"
                                                      success
                                                      onClick={() =>
                                                        handleWithdrawModal(item.amount)
                                                      }
                                                    >
                                                      Withdraw
                                                    </Button>
                                                  </TableCell>
                                              
                                              <TableCell>
                                                {item ? fromExponential(item.income/1000000000000000000) : "-"}
                                              </TableCell>

                                              <TableCell>
                                                {item ? fromExponential(item.totalIncome/1000000000000000000) : "-"}
                                              </TableCell>
                                            
                                                <TableCell> 
                                                  {item.income==0 ?
                                                      <Button
                                                      variant="outlined"
                                                      success
                                                      disabled
                                                      onClick={() =>
                                                        handleClaim()
                                                      }
                                                      >
                                                      Claim
                                                      </Button>
                                                      :
                                                      <Button
                                                      variant="outlined"
                                                      success
                                                      onClick={() =>
                                                        handleClaim()
                                                      }
                                                      >
                                                      Claim
                                                      </Button>
                                                  }                           
                                                 </TableCell>
                                             
                                                      </TableRow>
                                                      </TableBody>
                                                    </>
                                                   )
                                                  : 
                                                 <div style={{textAlign:"center",margin:"15%"}}>
                                                    <Typography variant="h5">No Transaction Found</Typography>
                                                  </div>
                                               }
                                               </>
                                           )
                                       }
                                        </>

                                    )
                                })
                               
                            }
                       
                      </Table>
                      : 
                      <div style={{textAlign:"center",margin:"15%"}}>
                        <Typography variant="h5">No Transaction Found</Typography>
                      </div>
            }
                    </TableContainer>
                  </Box>
              </Card>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
              </Box>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ValidatorUnstake;