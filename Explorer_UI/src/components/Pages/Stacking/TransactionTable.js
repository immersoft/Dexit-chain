import React, { useState,useEffect,Suspense } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { Card, Typography,Button, CircularProgress, Tooltip, } from "@mui/material";
import { Box } from "@mui/system";
import Connection from "../../../Contract";
import { useNavigate } from "react-router-dom";
import './TransactionTable.css';
import loader from "../../../Image/graphics-07.gif";
import { toast, ToastContainer } from "react-toastify";
import Proposal from "../../../Contract";
import fromExponential from 'from-exponential';
import InfoIcon from '@mui/icons-material/Info';



const columns = [
  { id: "rank", label: "Rank", minWidth: 20 },
  { id: "address", label: "Address", minWidth: 50 },
  { id: "amount", label: "Amount", minWidth: 50 },
  { id: "votingpower", label: "Voting Power/%", minWidth: 50 },
  { id: "status", label: "Status", minWidth: 50 },
  { id: "numberofdelegator", label: "No. of Delegators", minWidth: 50 },
  { id: "delegator", label: "Delegate", minWidth: 50 },
  { id: "incoming", label: "Income", minWidth: 50 },
  { id: "Totalincome", label: "Total Income", minWidth: 50 },
  { id: "claim", label: "Claim", minWidth: 50 },
  // { id: "firstBlock", label: "First Block", minWidth: 50 },
  // { id: "lastBlock", label: "Last Block", minWidth: 50 },
];



const TransactionTable = () => {
    const [dd,setDD] = useState()
    // console.log("TXTABLE",dd);
    const navigate = useNavigate();
    const [listData,setListData]=useState(false)
    const [noList,setnoList]=useState(false);
    let customList = []
    let [account, setAccount] = useState("");
    const[claimLoader,setClaimLoader]=useState(false)
    const[checkList,setCheckList]=useState(false)
    const[maximumValidator,setMaximumValidator]=useState(3)
    const[highestValidatorList,setHighestValidatorList]=useState()
   
    // console.log(Connection,"connections")

    const getAccounts = async () => {
      try {
        account = await window.ethereum.selectedAddress;
        setAccount(account);
      } catch (error) {
        console.log(error)
      }
  };
  
  try {
    window.ethereum.on("accountsChanged", function () {
      getAccounts();
    });
  } catch (error) {
    console.log(error)
  }
 
  useEffect(() => {
    getAccounts();
  },[]);
    
    async function getBalanceData(){
      try {
        let list= await Connection.getCurrentValidators() 
        handleValidatorListDetails(list)
      } catch (error) {
        console.log(error)
        setnoList(true)
      }
    }
  
  const getAmount= async(address)=>{
    try {
      let result= await Connection.stakeValidatorBalance(address)
      let amount= await result.toString()
      return amount
    } catch (error) {
      console.log(error)
    } 
  }

  const handleValidatorListDetails= async(list)=>{
    try {
      let contract=await Connection.getContractBalance()
     if(list){
      for(let i=0;i<list.length;i++){
        let dataget=await Connection.getValidatorInfo(list[i])
        let totalVotingPower=((dataget[3].toString()/1000000000000000000)/(contract.toString()/1000000000000000000))*100
        let customObject={
          address:list[i],
          amount:dataget[3].toString(),
          votingpower:totalVotingPower,
          status:dataget[1],
          numberOfDelegators:dataget[6].length,
          incomingCoins:dataget[4].toString(),
          incomingTotalCoins:dataget[5].toString(),
        }
        let check=customList.find(item=>item.address===list[i][0])
        if(check==undefined){
          customList.push(customObject)
        }
        }
     }
    // console.log(customList,"listttedd")
    
    setDD(customList)
    setListData(true)
    setListData(!listData)
    } catch (error) {
      console.log(error)
    }  
  }


      
  useEffect(() => {
    getBalanceData();
  }, [listData]);


  const validatorDetailsData=(details)=>{
    navigate('/validator_details',{state:{details:details}})
  }

const numberOfDelegators=(validatorAddress)=>{
  if(validatorAddress){
    navigate('/delegator_count', { state: { validatorAddress: validatorAddress } })
  }
}


const handleClaim=async()=>{
  try {
    setClaimLoader(true)
    const claimButton=await Connection.claimValidatorReward()
    let abc = await claimButton.wait();
    if (abc) {
      setClaimLoader(false);
      toast.success("Claim successfull")
    }
  } catch (error) {
    setClaimLoader(false);
    toast.error(error.data.message);
    console.log(error)
  }
}

const maxValidator=async()=>{
  let value = await Proposal.currentValue("MaxValidators");
  console.log(value.toString(),"value")
  setMaximumValidator(value.toString())
}

useEffect(()=>{
  maxValidator()
  highestValidator()
},[])

const highestValidator=async()=>{
  try {
    console.log("function called");
    let list = await Connection.getHighestValidators();
    // console.log(list,"highest Validator list")
    setHighestValidatorList(list)
  } catch (error) {
    console.log(error);
  }
}


const shortenAccountId = (fullStr) => {
  const strLen = 30;
  const separator = "...";

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
// console.log(highestValidatorList,"highestValidatorList")
  return (
    <>
      <ToastContainer  />

    {claimLoader? <Box sx={{ display: "flex", justifyContent: "center", padding: "10%" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              textAlign: "center",
            }}
          >
            <img src={loader} width={250} height={120} />
            <span
              style={{ fontSize: "1.2rem", lineHeight: "0", color: "grey" }}
            >
              Please Wait...
            </span>
          </div>
        </Box>
        :
      <div className="validator_container">
        <Card
          sx={{
            display: "flex",
            p: 2,
            flexDirection: "column",
            boxShadow: "none",
            background: "#F8FAFD",
          }}
        >
          <Typography variant="h6">
            Validators Leaderboard
          </Typography>
          <Box sx={{ flexGrow: 1, mt: 2 }}>
            <TableContainer component={Paper}>
              
                    <Table sx={{ minWidth: 650, p: 2 }} aria-label="simple table">
                    { dd!=undefined ?
                    <>
                        <TableHead>
                          <TableRow
                              className="heading_table"
                              sx={{ background: "#F8FAFD" }}
                          >
                              <TableCell
                                  style={{ top: 57, minWidth: 20 }}
                              >
                                Rank
                                
                              </TableCell>

                              <TableCell
                                  style={{ top: 57, minWidth: 50 }}
                              >
                                Address
                              </TableCell>

                              <TableCell
                                  style={{ top: 57, minWidth: 50 }}
                              >
                                <div style={{display:"flex"}}>
                                  Amount
                                  <Tooltip title="Info">
                                    <InfoIcon/>
                                  </Tooltip>
                                </div>
                              </TableCell>

                              <TableCell
                                  style={{ top: 57, minWidth: 50 }}
                              >
                                Voting Power/%
                              </TableCell>

                              <TableCell
                                  style={{ top: 57, minWidth: 50 }}
                              >
                                Status
                              </TableCell>

                              <TableCell
                                  style={{ top: 57, minWidth: 50 }}
                              >
                                No. of Delegators
                              </TableCell>

                              <TableCell
                                  style={{ top: 57, minWidth: 50 }}
                              >
                                Delegate
                              </TableCell>

                              <TableCell
                                  style={{ top: 57, minWidth: 50 }}
                              >
                                <div style={{display:"flex"}}>
                                  Income
                                  <Tooltip title="Info">
                                    <InfoIcon/>
                                  </Tooltip>
                                </div>
                                
                              </TableCell>

                              <TableCell
                                  style={{ top: 57, minWidth: 50 }}
                              >
                                <div style={{display:"flex"}}>
                                  Total Income
                                  <Tooltip title="Info">
                                    <InfoIcon/>
                                  </Tooltip>
                                </div>
                                
                              </TableCell>

                              <TableCell
                                  style={{ top: 57, minWidth: 50 }}
                              >
                                Claim
                              </TableCell>
                          </TableRow>
                        </TableHead>
                        {
                        dd.slice(0).sort(function(a,b){
                            return b.amount-a.amount
                        }).map((item,index)=>{
                            return(
                                <>
                                  <TableBody>
                                    <TableRow 
                                    sx={{
                                      "&:last-child td, &:last-child th": { border: 0 },
                                    }}
                                    >
                                      <TableCell component="th" scope="row">
                                        {index+1}
                                      </TableCell>

                                      <TableCell component="th" scope="row">
                                        {shortenAccountId(item.address)}
                                      </TableCell>
                                      
                                      <TableCell>
                                        {item.amount.slice(0,-18)}
                                      </TableCell>
          
                                      <TableCell>
                                      {item.amount.slice(0,-18)}/{item.votingpower.toFixed(2)}%
                                      </TableCell>
          
                                      <TableCell>
                                        {item.status===2 ? <Button variant={(highestValidatorList.includes(item.address)) ? "contained":"outlined"} color={(highestValidatorList.includes(item.address))?"success":"warning"} size='small'>{(highestValidatorList.includes(item.address)) ? "Active":"Inactive"}</Button> : item.status===1 ? <Button variant="outlined" size='small'>Created</Button> :item.status ===3 ? <Button variant="outlined" color="warning" size='small'>Un-Stake</Button> : item.status===4 ? <Button variant="outlined" color="warning" size='small'>Jailed</Button>:item.status===0 ? <Button variant="outlined" color="warning" size='small'>Not Exist</Button>:""}
                                        
                                      </TableCell>
          
                                      <TableCell>
                                        <Button id="btn" variant="outlined" size='small' onClick={()=>numberOfDelegators(item.address)}>{item.numberOfDelegators}</Button>
                                      </TableCell>
          
                                      <TableCell>
                                       {item.address.toLowerCase() != account ?  <Button variant="outlined" onClick={()=>validatorDetailsData(item)}>Delegate</Button> : <Button variant="contained" disabled>Delegate</Button>}
                                      </TableCell>
                                    
                                      <TableCell>
                                        {fromExponential(item.incomingCoins/1000000000000000000)}
                                      </TableCell>
          
                                      <TableCell>
                                        {fromExponential(item.incomingTotalCoins/1000000000000000000)}
                                      </TableCell>
          
                                      <TableCell>
                                       {item.address.toLowerCase() === account && item.incomingCoins!=0 ?  <Button variant="outlined" onClick={()=>handleClaim()}>Claim</Button> : <Button variant="contained" disabled>Claim</Button>}
                                      </TableCell>
          
          
                                    </TableRow>
                                  </TableBody>
                                </>
                            )
                        })
                      }
                      </>
                        :
                    <>
                    {dd===undefined ? noList==true?
                    <div style={{textAlign:"center",margin:"15%"}}>
                      <Typography variant="h5">No Transaction Found</Typography>
                    </div>
                    :
                    <>  
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                      <CircularProgress />
                    </Box>
                    </>
                   : "Error Occured"}
                      
                    </>
                    }

                    </Table> 
            </TableContainer>
          </Box>
        </Card>
      </div>
}
    </>
  );
};

export default TransactionTable;
