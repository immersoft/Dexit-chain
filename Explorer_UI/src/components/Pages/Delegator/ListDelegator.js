import React, { useState,useEffect,Suspense } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { Card, Typography,Button } from "@mui/material";
import { Box } from "@mui/system";
import Connection from "../../../Contract";
import { useNavigate,useLocation } from "react-router-dom";

const columns = [
  { id: "validator", label: "Validator Address", minWidth: 50 },
  { id: "delegator", label: "Delegator Address", minWidth: 50 },
  { id: "amount", label: "Amount", minWidth: 50 },
];



const ListDelegator = () => {
    const location=useLocation();
    // const vAddress=location.state.validatorAddress;
    const [dd,setDD] = useState([])
    const navigate = useNavigate();
    const [listData,setListData]=useState(false)
    let customList = []
    let [account, setAccount] = useState("");
    const[validatorAddress,setValidatorAddress]=useState("");
    // const vAddress=location.state.validatorAddress

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
    

  useEffect(()=>{
    if(location.state.validatorAddress){
      setValidatorAddress(location.state.validatorAddress)
      handleValidatorListDetails(location.state.validatorAddress)
    }

  },[])

    async function getBalanceData(){
      try {
        console.log("function called")
        let list= await Connection.getActiveValidators() 
        console.log(list,"list")
        // handleValidatorListDetails(list)
      } catch (error) {
        console.log(error)
      }
    }
  
  const handleValidatorListDetails= async(list)=>{
    try {
      let contract=await Connection.getValidatorInfo(list)
      console.log(contract,"contract")
     if(contract){
       console.log(contract[4],"contractjjjj")
      for(let i=0;i<contract[6].length;i++){
        console.log(contract[6][i],"list[i]")
        let dataget=await Connection.getValidatorInfo(contract[6][i])
        console.log(dataget,"dataget")

        let datagetnew=await Connection.getStakingInfo(contract[6][i],contract[0])
        console.log(datagetnew,"datagetnew")
        
        let customObject={
          address:contract[0],
          delegator:contract[6][i],
          amount:datagetnew[1].toString(),
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

      
  // useEffect(() => {
  //   getBalanceData();
  // }, []);


  const validatorDetailsData=(details)=>{
    navigate('/validator_details',{state:{details:details}})
  }

  return (
    <>
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
                    dd.length!=0 &&
                     dd.map((item)=>{
                        return(
                          <>
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
                              {item.delegator}
                            </TableCell>

                            <TableCell>
                              {item.amount.slice(0, -18)}
                            </TableCell>

                            {/* <TableCell>
                              <Button id="btn" variant="outlined" href="#outlined-buttons" size='small'>{item.numberOfDelegators}</Button>
                            </TableCell> */}

                            {/* <TableCell>
                             {item.address.toLowerCase() != account ?  <Button variant="outlined" onClick={()=>validatorDetailsData(item)}>Stake</Button> : <Button variant="contained" disabled>Stake</Button>}
                            </TableCell> */}
                          
                          </TableRow>
                          </>
                        )
                      })
                    
                  }
                
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Card>
      </div>
    </>
  );
};

export default ListDelegator;
