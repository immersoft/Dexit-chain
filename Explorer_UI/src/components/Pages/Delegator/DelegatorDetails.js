import React,{useState,useEffect} from 'react'
import Connection from '../../../Contract'
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Card, Typography,Box, Button,Modal,FormControl,OutlinedInput,FormHelperText } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress'
import ForwardIcon from '@mui/icons-material/Forward';
import moment from 'moment'
import bigInt from 'big-integer';

const columns = [
    { id: "id", label: "ID", minWidth: 20 },
    { id: "start", label: "Start Time", minWidth: 20 },
    { id: "delegator", label: "Delegator Address", minWidth: 20 },
    { id: "navigate", label: "", minWidth: 20 },
    { id: "validator", label: "Validator Address", minWidth: 50 },
    { id: "amount", label: "Amount", minWidth: 50 },
    { id: "end", label: "End Time", minWidth: 50 },
    { id: "unstake", label: "Un-Stake", minWidth: 50 },
    // { id: "lastBlock", label: "Last Block", minWidth: 50 },
  ];

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450,
    bgcolor: 'white',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};


const DelegatorDetails = () => {
    const[delegatorsList,getDelegatorsList]=useState()
    let[account,setAccount]=useState()
    const[allDelegatorData,setAllDelegatorData]=useState()
    const[allDelegatorList,getAllDelegatorList]=useState()
    const [listData,setListData]=useState(true)
    const [inputAmount,setInputAmout]=useState(0)
    const [openUnStack, setOpenUnStack] = React.useState(false);

    let customList=[]
    // console.log(Connection,"data")

    const getAccounts = async () => {
      try {
        account = await window.ethereum.selectedAddress;
        setAccount(account);
      } catch (error) {
        console.log(error)
      }    
    };

   const accountAddress=()=>{
    try {
      window.ethereum.on("accountsChanged", function () {
        getAccounts();
      });
    } catch (error) {
      console.log(error)
    }
   } 
   
   
    
    useEffect(()=>{
      accountAddress()
      getDelegatorList()
      getAccounts();
      getDelegatorBalance()
    },[listData])
  
    const getDelegatorList=async()=>{
      try {
        let listdata=await Connection.getDelegatorsList()
        getDelegatorsList(listdata)
        handleValidatorListDetails(listdata)
      } catch (error) {
        console.log(error)
      }
      
    }

    const getDelegatorBalance=async()=>{
      try {
        let balance=await Connection.delegatorStakeBalance(account,"0x93D6cf0dD91634e3880f1fD45549f899f73d0044")
        let balance2=await Connection.getDelegatorsDetails("0x93D6cf0dD91634e3880f1fD45549f899f73d0044",1)
        // console.log(balance2,"balance")
      } catch (error) {
        console.log(error)
      }
       
    }


    const handleValidatorListDetails= async(list)=>{
      try {
        if(list){
        
          for(let i=0;i<list.length;i++){
            let dataget=await Connection.getDelegatorsDetails(list[i].validatorAddress,list[i].ID.toString())
            // console.log(dataget,"list[i]")
            // console.log(dataget,"dataget")
            // let totalVotingPower=(dataget.toString()/contract.toString())*100
            let customObject={
                id:list[i].ID.toString(),
                delegatorAddress:list[i].delegatorAddress,
                validatorAddress:list[i].validatorAddress,
                amount:dataget.stakeAmount.toString()/1000000000000000000,
                startTime:dataget.startTime.toString(),
                endTime:dataget.endTime.toString(),
            }
            let check=customList.find(item=>item.validatorAddress===list[i].validatorAddress)
            if(check==undefined){
              customList.push(customObject)
            }
            // console.log(check,"console for check")
            }
         }
         getAllDelegatorList(customList)
         setListData(!listData)
      } catch (error) {
        console.log(error)
      }
        
    }

    const handleCloseUnStack = () => setOpenUnStack(false);

    const unStackAmount=async(data)=>{
        setAllDelegatorData(data)
        // console.log(data.amount)
        setOpenUnStack(true)
        // let stakerAmountData2 = bigInt(4 * 10 ** 18);
        // console.log(data.validatorAddress,"validatorAddress")
        // let result = await Connection.unStakeValidators("0xb710C0779AFe841c6dF6e254877A11f1beEe302D",stakerAmountData2.value,1);
        // console.log(result,"result")
        // let delegateUnstack=await Connection.unStakeValidators(account,)
    }

    const handleunStake = async () => {
        if(allDelegatorData){
            if(parseInt(inputAmount)>allDelegatorData.amount){
                alert("UnStake amount is greater than Staked amount")
                setInputAmout(0)
                setOpenUnStack(false)
            }
            else if(parseInt(inputAmount)<=allDelegatorData.amount){
              try {
                let stakerAmountData2 = bigInt(inputAmount * 10 ** 18);
                // console.log(stakerAmountData2.value,"stakerAmountData2")
                let result = await Connection.unStakeValidators(allDelegatorData.validatorAddress,stakerAmountData2.value,allDelegatorData.id);
                // console.log(result)
                setInputAmout(0)
                setOpenUnStack(false)
                // console.log("call unstack functin")
              } catch (error) {
                console.log(error)
              }
              
            }
        }
        // let stakerAmountData2 = bigInt(stakerAmount2 * 10 ** 18);
        // let result = await Connection.unStake(1,stakerAmountData2.value);
        // console.log(result,"result of the given data is ")
        // setOpenUnStack(false)
    }

  return (
    <>
        <div className='unstack_modal'>
                <Modal
                    open={openUnStack}
                    onClose={handleCloseUnStack}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <Typography variant="h4" sx={{ textAlign: 'center' }}>Un-Staking</Typography>
                        <div className='text_input'>
                        <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                            <OutlinedInput
                                id="outlined-adornment-weight"
                                aria-describedby="outlined-weight-helper-text"
                                value={inputAmount}
                                onChange={(e) => setInputAmout(e.target.value)}
                                inputProps={{
                                'aria-label': 'weight',
                                }}
                            />
                        <FormHelperText id="outlined-weight-helper-text">max limit {allDelegatorData ? allDelegatorData.amount : "-"}</FormHelperText>
                        </FormControl>
                        </div>

                        <div className='btn_postdetails'>
                            <Button variant="contained" color="primary" sx={{ mt: 1 }} onClick={handleunStake}>Submit</Button>
                            <Button variant="contained" color="primary" sx={{ mt: 1 }} onClick={() => handleCloseUnStack()}>Close</Button>
                        </div>
                    </Box>
                </Modal>
        </div>


    <div className="validator_container">
        { allDelegatorList ?
        <Card
          sx={{
            display: "flex",
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
                  <TableRow>
                    <Typography sx={{ p: 2, fontSize: "14px" }}>
                    {allDelegatorList ? allDelegatorList.length : "-"} Delegators found
                    </Typography>
                  </TableRow>
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
                          {item.delegatorAddress && item.amount ?
                            <>
                          { item.delegatorAddress.toLowerCase()===account ?
                          <TableRow 
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        //   onClick={()=>validatorDetailsData(item)}
                          >
                            <TableCell component="th" scope="row">
                                {item.id}
                            </TableCell>

                            <TableCell>
                            {moment
                            .unix(item.startTime)
                            .format("YYYY-MM-DD h:mm:ss a")}
                             </TableCell>

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
                            {item.amount}
                            </TableCell>

                            <TableCell>
                            {moment
                            .unix(item.endTime).add(3, 'days').calendar()
                            }
                            </TableCell>
                               
                            <TableCell>
                                <Button variant="outlined" success onClick={()=>unStackAmount(item)}>Un-Stake</Button>
                            </TableCell>
                          </TableRow>
                          : ""
                            }
                            </>
                            :""
                        }
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
        <CircularProgress />
        </Box>
    }
    </div>
    </>
  )
}

export default DelegatorDetails