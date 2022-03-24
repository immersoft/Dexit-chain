import React, { useState,useEffect,Suspense } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { Card, Typography,Button, CircularProgress, } from "@mui/material";
import { Box } from "@mui/system";
import Connection from "../../../Contract";
import { useNavigate } from "react-router-dom";
import './TransactionTable.css';
import loader from "../../../Image/graphics-07.gif";
import { toast, ToastContainer } from "react-toastify";


const columns = [
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
    const [dd,setDD] = useState([])
    // console.log("TXTABLE",dd);
    const navigate = useNavigate();
    const [listData,setListData]=useState(false)
    let customList = []
    let [account, setAccount] = useState("");
    const[claimLoader,setClaimLoader]=useState(false)
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
        // console.log("function called")
        let list= await Connection.getCurrentValidators() 
        // console.log(list,"list")
        handleValidatorListDetails(list)
      } catch (error) {
        console.log(error)
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
    
    setDD(customList)
    setListData(!listData)// console.log(dd,"listttedd")
    } catch (error) {
      console.log(error)
    }  
  }


  const listState=()=>{
    if(dd.length!=0){
      console.log("listed collection")
        return dd.map(async(item,index)=>{
            return(
                <>
                {/* {console.log(await getAmount(item[0]),"fdfdfdfd")}
                {console.log(await Connection.stakeValidatorBalance(item[0]))}
                {console.log(item[0],"item")} */}
                </>
            )
        })
    }
}

      
  useEffect(() => {
    getBalanceData();
  }, [listData]);


  const validatorDetailsData=(details)=>{
    navigate('/validator_details',{state:{details:details}})
  }

const numberOfDelegators=(validatorAddress)=>{
  console.log(validatorAddress,"validatorAddress")
  if(validatorAddress){
    navigate('/delegator_count', { state: { validatorAddress: validatorAddress } })
  }
}


const handleClaim=async()=>{
  console.log(account,"called")
  try {
    setClaimLoader(true)
    const claimButton=await Connection.claimValidatorReward()
    let abc = await claimButton.wait();
    if (abc) {
      setClaimLoader(false);
      toast.success("Claim successfull")
    }
    console.log(claimButton,"claimButton")
  } catch (error) {
    setClaimLoader(false);
    toast.error(error.data.message);
    console.log(error)
  }
}

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
            Validators Top Leaderboard (Blocks Validated)
          </Typography>
          <Box sx={{ flexGrow: 1, mt: 2 }}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650, p: 2 }} aria-label="simple table">
                <TableHead>
                  <TableRow
                    className="heading_table"
                    sx={{ background: "#F8FAFD" }}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        style={{ top: 57, minWidth: column.minWidth }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* {console.log(dd, "jhjhjhj")} */}
                  {
                    dd.length>0 ?
                     dd.slice(0).sort(function(a,b){
                       return b.amount -a .amount;
                     })
                     .map((item,index)=>{
                        return(
                          <>
                        { item.amount/1000000000000000000!==0 ?

                          <TableRow 
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                          // onClick={()=>validatorDetailsData(item)}
                          >
                          <TableCell component="th" scope="row">
                            {item.address}
                          </TableCell>
                            
                            <TableCell>
                              {item.amount/1000000000000000000}
                            </TableCell>

                            <TableCell>
                            {item.amount/1000000000000000000}/{item.votingpower.toFixed(2)}%
                            </TableCell>

                            <TableCell>
                              {item.status===2 ? <Button variant={(index<3) ? "contained":"outlined"} color={(index<3)?"success":"warning"} size='small'>{(index<3) ? "Active":"Inactive"}</Button> : item.status===1 ? <Button variant="outlined" size='small'>Created</Button> :item.status ===3 ? <Button variant="outlined" color="warning" size='small'>Un-Stake</Button> : item.status===4 ? <Button variant="outlined" color="warning" size='small'>Jailed</Button>:item.status===0 ? <Button variant="outlined" color="warning" size='small'>Not Exist</Button>:""}
                              
                            </TableCell>

                            <TableCell>
                              <Button id="btn" variant="outlined" size='small' onClick={()=>numberOfDelegators(item.address)}>{item.numberOfDelegators}</Button>
                            </TableCell>

                            <TableCell>
                             {item.address.toLowerCase() != account ?  <Button variant="outlined" onClick={()=>validatorDetailsData(item)}>Delegate</Button> : <Button variant="contained" disabled>Delegate</Button>}
                            </TableCell>
                          
                            <TableCell>
                              {item.incomingCoins/1000000000000000000}
                            </TableCell>

                            <TableCell>
                              {item.incomingTotalCoins/1000000000000000000}
                            </TableCell>

                            <TableCell>
                             {item.address.toLowerCase() === account ?  <Button variant="outlined" onClick={()=>handleClaim()}>Claim</Button> : <Button variant="contained" disabled>Claim</Button>}
                            </TableCell>


                          </TableRow>
                        :
                          ""
                        }
                          </>
                        )
                      }):
                      <>
                      { 
                        !dd ? "Not Found":
                        <>
                        <Box sx={{ display: 'flex',justifyContent:"center" }}>
                          <CircularProgress size={30} />
                        </Box> 
                       </>
                      }
                     
                      </>
                      // <Box sx={{ display: 'flex',justifyContent:"center" }}>
                      //   <CircularProgress size={30} />
                      // </Box>   
                  }
                 
                </TableBody>
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
