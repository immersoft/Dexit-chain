import { Box, Card, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, TextField, Snackbar, Alert } from '@mui/material'
import Web3 from "web3";
import React,{useEffect,useState} from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './singleTransaction.css'
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import moment from 'moment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';



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
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }
  

const TransactionDetails = () => {
    const location=useLocation();
    const getDetails=location.state.details
    console.log("getdata",getDetails)
    const timeStamp=location.state.blockTime
    const navigate=useNavigate()
    const web3 = new Web3();

    // web3.setProvider("https://datafeed.dexit.network");
//   web3.setProvider("https://testnet.dexit.network");  

    web3.setProvider("https://datafeed.dexit.network");


    const[getDetailsInfo,setDetailsInfo]=useState()

    const [value, setValue] = React.useState(0);
    const[blockdata,setBlockData]=useState()
    const[callData,setCallData]=useState(true)
    const[infoDetailsData,setInfoDetailsData]=useState()
    const [openAlert,setOpenAlert]=React.useState(false)


    const handleChange = (event, newValue) => {
      setValue(newValue);
    };
  
    // console.log(location.state.blockTime,"time in jjhhjhjh")

    const handleChangeState=()=>{
        navigate('/')
    }
    // console.log(getDetails,"Hello TransactionDetails");
  
        useEffect(()=>{
            getInfo()
        },[getDetails,callData])
    
    const getInfo=async()=>{
    try {
        console.log("try called",getDetails.transactionHash)
        let getTransactionDetails =await web3.eth.getTransaction(getDetails.transactionHash)
            console.log(getTransactionDetails,"getTransactionDetails////////////")
            setDetailsInfo(getTransactionDetails)

            let getBlock =await web3.eth.getBlock(getTransactionDetails.blockNumber)
            setBlockData(getBlock)
            setCallData(!callData)
            let infoBlock =await web3.eth.getTransaction(getDetails.transactionHash)
            console.log(infoBlock,"infoBlock////////////")
            setInfoDetailsData(infoBlock)
    } catch (error) {
        console.log(error)
    }

        
        }

    const copyHash=()=>{
    //   console.log("side")
      navigator.clipboard.writeText(getDetails.transactionHash? getDetails.transactionHash:"");
      setOpenAlert(true)
      // alert("Hash Copied")
    }


  return (
    <>
    {getDetails ?
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <ArrowBackIcon onClick={()=>handleChangeState()} fontSize="large" />

        <TableContainer component={Paper}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Overview" {...a11yProps(0)} />
          <Tab label="Logs" {...a11yProps(1)} />
          <Tab label="Comment" {...a11yProps(2)} />
        </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableBody>
                    {/* <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left">Transaction Hash :</TableCell>
                        <TableCell align="left">{getDetails.transactionHash}</TableCell>
                    </TableRow> */}

                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left">Transaction Hash :</TableCell>
                        <TableCell align="left"><span style={{display:"flex",alignItems:"center"}}>{getDetails.transactionHash} <ContentCopyIcon style={{marginLeft:"0.5rem",cursor:"pointer"}} onClick={()=>copyHash()}/></span>
                        {openAlert ? <Snackbar open={openAlert} autoHideDuration={2000} onClose={()=>setOpenAlert(false)} >
                        <Alert onClose={()=>setOpenAlert(false)} severity="info">Hash Copied</Alert>
                        </Snackbar> : null}
                        </TableCell>
                    </TableRow>

                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left">Status :</TableCell>
                        <TableCell align="left">{getDetails.status==true ? (<Button variant="contained" disabled id="success">Success</Button>):(<Button variant="contained" disabled id="unsucess">Failed</Button>)}</TableCell>
                    </TableRow>


                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left"  >Block Number :</TableCell>
                        <TableCell align="left">{getDetails.blockNumber}</TableCell>
                    </TableRow>


                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left"  >Time :</TableCell>
                        <TableCell align="left">{blockdata ? moment.unix(blockdata.timestamp).format("YYYY-MM-DD h:mm:ss a") : "-"}</TableCell>
                    </TableRow>

                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left"  >From :</TableCell>
                        <TableCell align="left">{getDetails.from}</TableCell>
                    </TableRow>

                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left"  >To :</TableCell>
                        <TableCell align="left">{getDetails.to ? getDetails.to : "-"}</TableCell>
                    </TableRow>

                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left"  >Contract Address :</TableCell>
                        <TableCell align="left">{getDetails.contractAddress ? getDetails.contractAddress:"-"}</TableCell>
                    </TableRow>

                    {/* <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left"  >Input Data :</TableCell>
                        <TableCell align="left">
                        <TextField
                                id="outlined-multiline-flexible"
                                multiline
                                maxRows={4}
                                defaultValue={getDetailsInfo ? getDetailsInfo.input:"-"}
                                sx={{width:'50ch'}}
                                InputProps={{
                                    readOnly: true,
                                }}
                                />
                        </TableCell>
                    </TableRow> */}

                  <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left"  >Value :</TableCell>
                        <TableCell align="left">{infoDetailsData ? infoDetailsData.value:"-"}</TableCell>
                    </TableRow>

                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left"  >Gas Price :</TableCell>
                        <TableCell align="left">{getDetailsInfo ? getDetailsInfo.gasPrice:"-"}</TableCell>
                    </TableRow>

                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left"  >Gas Used by Transaction :</TableCell>
                        <TableCell align="left">{getDetails.gasUsed}</TableCell>
                    </TableRow>

                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left"  >Nonce :</TableCell>
                        <TableCell align="left">{getDetailsInfo ? getDetailsInfo.nonce:"-"}</TableCell>
                    </TableRow>

                </TableBody>
          </Table>
        </TabPanel>
        </TableContainer>

        </Box>
    </Card>
    :
    "not get"
    }
    </>
  )
}

export default TransactionDetails