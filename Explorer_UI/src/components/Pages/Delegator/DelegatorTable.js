import React,{useState,useEffect} from 'react'
import Connection from '../../../Contract'
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Card, Typography,Box, Button } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress'
import ForwardIcon from '@mui/icons-material/Forward';

const columns = [
    { id: "delegator", label: "Delegator Address", minWidth: 20 },
    { id: "navigate", label: "", minWidth: 20 },
    { id: "validator", label: "Validator Address", minWidth: 50 },
    { id: "amount", label: "Amount", minWidth: 50 },
    // { id: "lastBlock", label: "Last Block", minWidth: 50 },
  ];

const DelegatorTable = () => {
    const[delegatorsList,getDelegatorsList]=useState()
    let[account,setAccount]=useState()
    const[allDelegatorList,getAllDelegatorList]=useState()
    const [listData,setListData]=useState(false)

    let customList=[]
    console.log(Connection,"data")

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
     
   
    console.log(account,"account")
    useEffect(()=>{
        getDelegatorList()
      getAccounts();
      getDelegatorBalance()
    },[])
  
    const getDelegatorList=async()=>{
      try {
        let listdata=await Connection.getDelegatorsList()
        console.log(listdata)
        getDelegatorsList(listdata)
        handleValidatorListDetails(listdata)
      } 
      catch (error) {
        console.log(error)
      }
       
    }

    const getDelegatorBalance=async()=>{
      try {
        let balance=await Connection.delegatorStakeBalance(account,"0x93D6cf0dD91634e3880f1fD45549f899f73d0044")
        let balance2=await Connection.getDelegatorsDetails("0x93D6cf0dD91634e3880f1fD45549f899f73d0044",1)
        console.log(balance2,"balance")
      } catch (error) {
        console.log(error)
      }
       
    }


    const handleValidatorListDetails= async(list)=>{
      try {
        if(list){
          console.log(list,"listsss data")
          console.log(list[0].ID.toString(),"listsss data")
          console.log(list[0].delegatorAddress,"listsss data")
          console.log(list[0].validatorAddress,"listsss data")
         for(let i=0;i<list.length;i++){
           let dataget=await Connection.delegatorStakeBalance(list[i].delegatorAddress,list[i].validatorAddress)
           console.log(dataget.toString(),"list[i]")
   
           console.log(dataget,"datagetaaaa")
           // let totalVotingPower=(dataget.toString()/contract.toString())*100
           let customObject={
             delegatorAddress:list[i].delegatorAddress,
             validatorAddress:list[i].validatorAddress,
             amount:dataget.toString()
           }
           let check=customList.find(item=>item.validatorAddress===list[i].validatorAddress)
           if(check==undefined){
             customList.push(customObject)
           }
           console.log(check,"check")
           }
        }
        getAllDelegatorList(customList)
        setListData(!listData)
      } 
      catch (error) {
        console.log(error)
      }      
    }

  return (
      
    <div className="validator_container">
        { allDelegatorList ?
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
            All Delegators
          </Typography>
          <Box sx={{ flexGrow: 1, mt: 2 }}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650, p: 2 }} aria-label="simple table">
                <TableHead>
                  {/* <TableRow>
                    <Typography sx={{ p: 2, fontSize: "14px" }}>
                    {allDelegatorList ? allDelegatorList.length : "-"} Delegators found
                    </Typography>
                  </TableRow> */}
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
                  {
                    allDelegatorList &&
                    allDelegatorList.map((item)=>{
                        return(
                          <>
                          <TableRow 
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        //   onClick={()=>validatorDetailsData(item)}
                          >
                            <TableCell component="th" scope="row">
                                {item.delegatorAddress}
                            </TableCell>
                            
                            <TableCell>
                                <ForwardIcon/>
                            </TableCell>

                            <TableCell>
                            {item.validatorAddress}
                            </TableCell>

                            <TableCell>
                            {item.amount/1000000000000000000}
                            </TableCell>

                          
                          
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
        :
        <Box sx={{ display: 'flex',justifyContent:"center",mt:4 }}>
        {/* <CircularProgress /> */}
        <Typography variant="h6">Not Found</Typography>
        </Box>
    }
    </div>
  )
}

export default DelegatorTable