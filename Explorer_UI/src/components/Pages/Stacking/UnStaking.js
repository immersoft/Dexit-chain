import React, { useState, useEffect, Suspense } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
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

const columns = [
  // { id: "id", label: "UniqueId", minWidth: 20 },
  // { id: "start", label: "Start Time", minWidth: 20 },
  { id: "address", label: "Address", minWidth: 50 },
  { id: "vaddress", label: "Validator Address", minWidth: 50 },
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

const UnStaking = () => {
  let customList = [];
  let [account, setAccount] = useState("");
  const [stackedAmountData, setStackedAmountData] = useState();
  const [openUnStack, setOpenUnStack] = React.useState(false);
  const [unStackPrice, setUnStackPrice] = useState(0);
  const [dd, setDD] = useState([]);
  const [listData, setListData] = useState(true);
  const [value, setValue] = React.useState(0);
  const [withdrawl, setWithdrawl] = useState(false);
  const [errorWithdrawl, setErrorWithDrawl] = useState(false);
  const [errorUnstake, setErrorUnStaking] = useState();
  const [open, setOpen] = React.useState(true);
  const [withdrawTimeOut, setWithdrawTimeOut] = useState(60);
  const [withdrawTimeOutStatus, setWithdrawTimeOutStatus] = useState(false);
  const [unstakeDelegateError, setUnstakeDelegateError] = useState();
  const [toggleUnstakeError, setToggleUnstakeError] = useState(false);

  const [deUnstake, setDeUnstake] = useState(false);
  const [deUnstakeError, setDeUnstakeError] = useState();
  const [deWithdraw, setDeWithdraw] = useState(false);
  const [deWithdrawError, setDeWithdrawError] = useState();
  const [loading, setLoading] = useState(false);
  const[claimLoader,setClaimLoader]=useState(false)

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
      let contract = await Connection.totalDXTStake();
      // console.log(contract,"contract")
      if (list) {
        for (let i = 0; i < list.length; i++) {
          let dataget = await Connection.getValidatorInfo(list[i]);
          //  console.log(dataget,"dddddddd")
          //  console.log(dataget[4],"dsdsffffffffgggg")
          if (dataget[6].length != 0) {
            //  console.log(dataget,"dsdsfffff")
            //  console.log(dataget[2],"infoDetailsssss")
            for (let j = 0; j < dataget[6].length; j++) {
              // console.log(dataget[6][j], "dsdsfffff");
              // let address=await dataget[6][j].toString()
              // let amount=await getAmount(address)
              if (dataget[6][j].toLowerCase() === account) {
                // console.log(dataget[4][j],"inside id")
                // console.log(dataget,"insideddd id")
                let dataget22 = await Connection.getValidatorInfo(
                  dataget[6][j]
                );
                // console.log(dataget22, "dataget22");
                let infoDetails = await Connection.getStakingInfo(
                  dataget[6][j],
                  dataget[0]
                );
                // console.log(infoDetails,"kkkkkkinfoDetails")
                let data = {
                  address: dataget[6][j],
                  validatorAddress: dataget[0],
                  amount: infoDetails[0].toString() / 1000000000000000000,
                  totalAmount: infoDetails[0].toString() / 1000000000000000000,
                  income:infoDetails[3].toString()/1000000000000000000,
                  // totalIncome:dataget[5].toString()/1000000000000000000,
                  status:dataget[1]
                };

                customList.push(data);
              } else if (dataget[6][j].toLowerCase() !== account) {
                // console.log("inside second ekseif",dataget)
                // console.log(account,"accounthhh")
                let infoDetails = await Connection.getStakingInfo(
                  account,
                  account
                );
                // console.log(infoDetails,"kkkkkkinfoDetails")
                // console.log(dataget,"datagetggggghhhh")
                let data = {
                  address: dataget[0],
                  // validatorAddress:dataget[0],
                  totalAmount: dataget[3].toString() / 1000000000000000000,
                  amount: dataget[2].toString() / 1000000000000000000,
                  income:dataget[4].toString()/1000000000000000000,
                  totalIncome:dataget[5].toString()/1000000000000000000,
                  status:dataget[1],
                };
                let check = customList.find(
                  (item) => item.address.toLowerCase() === account
                );
                if (check == undefined) {
                  customList.push(data);
                }
                // customList.push(data)
              }
            }
          } else if (dataget[6].length === 0) {
            //  console.log(dataget,"no delei")
            if (dataget[0].toLowerCase() === account) {
              //  console.log(dataget,"infoDetailsssssdddd")

              let stakingResult = await Connection.getStakingInfo(
                dataget[0].toLowerCase(),
                account
              );
              // console.log(stakingResult,"stakingResultsecond")
              // console.log(dataget[3].toString(),"stakingResult")
              let customObject = {
                address: dataget[0],
                amount: dataget[2].toString() / 1000000000000000000,
                totalAmount: dataget[3].toString() / 1000000000000000000,
                status:dataget[1],
                income:dataget[4].toString()/1000000000000000000,
                totalIncome:dataget[5].toString()/1000000000000000
              };

              customList.push(customObject);
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
      }
    } catch (error) {
      setLoading(false);

      console.log("errrrr", error);
      if (error.code ===4001) {
        toast.error(error.message);
      } else if (error.data.message) {
        setUnstakeDelegateError(error);
        toast.error(error.data.message);
      }
    }

    // }
    // }
    // let stakerAmountData2 = bigInt(stakerAmount2 * 10 ** 18);
    // let result = await Connection.unStake(1,stakerAmountData2.value);
    // console.log(result)
    // setOpenUnStack(false)
  };

  const handleWithdraw = async () => {
    try {
      setLoading(true);
      let result = await Connection.withdrawValidatorStaking();
      let abc = await result.wait();
      if (abc) {
        setLoading(false);
        window.location.reload();
      }
      console.log(result);
    } catch (error) {
      console.log(error);
      setLoading(false);
      if (error.code ===4001) {
        toast.error(error.message);
      }
     else if (error.data.message) {
        toast.error(error.data.message);
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
        toast.error(error.message);
      }
       else if (error.data) {
         console.log("Errorrrrrr---",error.data.message)
         toast.error(error.data.message);
        // setDeUnstakeError(error);
        setDeUnstake(true);
      }
    }
  };

  const delegateWithDraw = async (validAddress) => {
    try {
      setLoading(true);

      let delegateWithdrwal = await Connection.withdrawDelegatorStaking(
        validAddress
      );
      let abc = await delegateWithdrwal.wait();
      if (abc) {
        setLoading(false);
        toast.success("Withdraw successfull")
        getBalanceData()
      }
      console.log(delegateWithdrwal, "delegateWithdrwal");
    } catch (error) {
      setLoading(false);
      if(error.code ===4001){
        console.log("if")
        toast.error(error.message);
      }
      else if (error.data.message) {
        console.log("else if")

        toast.error(error.data.message);
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
      }
    } 
    catch (error) {
      setLoading(false);
      toast.error(error.data.message);
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
      }
    } catch (error) {
      setLoading(false);
      toast.error(error.data.message);
      console.log(error)
    }
  }

  return (
    <>
      <ToastContainer  />

      <div className="unstack_modal">
        <Modal
          open={openUnStack}
          onClose={handleCloseUnStack}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography variant="h4" sx={{ textAlign: "center" }}>
              Un-Staking
            </Typography>
            <div className="text_input">
              <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined">
                <OutlinedInput
                  id="outlined-adornment-weight"
                  aria-describedby="outlined-weight-helper-text"
                  value={unStackPrice}
                  onChange={(e) => setUnStackPrice(e.target.value)}
                  inputProps={{
                    "aria-label": "weight",
                  }}
                />
                <FormHelperText id="outlined-weight-helper-text">
                  max limit {stackedAmountData ? stackedAmountData.amount : "-"}
                </FormHelperText>
              </FormControl>
            </div>

            <div className="btn_postdetails">
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 1 }}
                onClick={handleunStake}
              >
                Submit
              </Button>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 1 }}
                onClick={() => handleCloseUnStack()}
              >
                Close
              </Button>
            </div>
          </Box>
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
                  boxShadow: "none",
                  background: "#F8FAFD",
                }}
              >
                <Typography variant="h6">Un-Stake Amount Dashboard</Typography>

                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="basic tabs example"
                  >
                    <Tab label="Stake Amount" {...a11yProps(0)} />
                  </Tabs>
                </Box>

                <TabPanel value={value} index={0}>
                  <Box sx={{ flexGrow: 1, mt: 2 }}>
                    <TableContainer component={Paper}>
                      <Table
                        sx={{ minWidth: 650, p: 1 }}
                        aria-label="simple table"
                      >
                        <TableHead>
                          <TableRow
                            className="heading_table"
                            sx={{ background: "#F8FAFD" }}
                          >
                            {columns.map((column,index) => (
                              <TableCell
                                key={index}
                                align={column.align}
                                style={{ top: 57, minWidth: column.minWidth }}
                              >
                                {column.label}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {
                            dd.length > 0
                              ? dd.map((item, index) => {
                                  return (
                                    <>
                                      {item.address ? (
                                        <>
                                          {item.address.toLowerCase() ===
                                            account &&
                                          item.amount != 0 &&
                                          item.totalAmount != undefined ? (
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
                                                {item.address}
                                              </TableCell>

                                              <TableCell
                                                component="th"
                                                scope="row"
                                              >
                                                {item.validatorAddress
                                                  ? item.validatorAddress
                                                  : "-"}
                                              </TableCell>

                                              <TableCell>
                                                {item ? item.amount : "-"}
                                              </TableCell>

                                              <TableCell>
                                                {item ? item.totalAmount : "-"}
                                              </TableCell>

                                              {item.validatorAddress ? (
                                                <>
                                                  <TableCell>
                                                   
                                                    <Button
                                                      variant="outlined"
                                                      success
                                                      onClick={() =>
                                                        delegateUnstake(
                                                          item.validatorAddress,
                                                          index
                                                        )
                                                      }
                                                    >
                                                      Delegate Un-Stake
                                                    </Button>
                                                   
                                                  </TableCell>

                                                  <TableCell>
                                                    <Button
                                                      variant="outlined"
                                                      success
                                                      onClick={() =>
                                                        delegateWithDraw(
                                                          item.validatorAddress
                                                        )
                                                      }
                                                    >
                                                     Delegate Withdraw
                                                    </Button>
                                                   
                                                  </TableCell>
                                                </>
                                              ) : (
                                                <>
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
                                                        handleWithdraw()
                                                      }
                                                    >
                                                      Withdraw
                                                    </Button>
                                                  </TableCell>
                                                </>
                                              )}
                                              
                                              <TableCell>
                                                {item ? item.income : "-"}
                                              </TableCell>

                                              <TableCell>
                                                {item ? item.totalIncome : "-"}
                                              </TableCell>
                                            
                                            {
                                              item.validatorAddress ? (
                                              <>
                                                <TableCell>                            
                                                   <Button
                                                     variant="outlined"
                                                     success
                                                     onClick={() =>
                                                       delegateClaim(item.validatorAddress)
                                                     }
                                                   >
                                                     Delegate Claim
                                                   </Button>
                                                  
                                                 </TableCell>
                                              </>
                                              ):
                                              (
                                              <>
                                                <TableCell>                            
                                                   <Button
                                                     variant="outlined"
                                                     success
                                                     onClick={() =>
                                                       handleClaim()
                                                     }
                                                   >
                                                     Claim
                                                   </Button>
                                                  
                                                 </TableCell>
                                              </>
                                              )
                                            }
                                            </TableRow>
                                          ) : (
                                            "Not Found"
                                          )}
                                        </>
                                      ) : (
                                        <Box
                                          sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            mt: 4,
                                            ml: 15,
                                          }}
                                        >
                                          <CircularProgress />
                                        </Box>
                                      )}
                                    </>
                                  );
                                })
                              : <>
                                    <Box
                                          sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            mt: 4,
                                            ml: 15,
                                          }}
                                        >
                                          <CircularProgress />
                                        </Box>
                              </>
                          }

                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </TabPanel>

                {/* <TabPanel value={value} index={1}>
              <DelegatorDetails/>
          </TabPanel> */}
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

export default UnStaking;