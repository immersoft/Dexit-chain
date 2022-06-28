import { Box, Button, Card, Tab, Table, TableBody,Paper, TableCell, TableContainer, TableRow, Tabs, TextField, Typography } from '@mui/material';
import React, { useEffect ,useState} from 'react'
import { useLocation } from 'react-router-dom'
import Web3 from "web3";
import moment from 'moment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PropTypes from 'prop-types';
import {useNavigate} from 'react-router-dom'


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

const BlockNumberDetails = () => {
    const [transactionLists,setTransactionLists]=useState()
    const navigate=useNavigate()
    const web3 = new Web3();
    // web3.setProvider("https://datafeed.dexit.network");
//   web3.setProvider("https://testnet.dexit.network");  

  web3.setProvider("https://datafeed.dexit.network");

    const location=useLocation()
    const[detailsData,setDetailsData]=useState()
    console.log(location.state.row,"blockdetails")
    // console.log(location.state.row,"blockdetails")
    useEffect(()=>{
        if(location.state.row){
            getData(location.state.row)
        }
    },[])

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
      setValue(newValue);
    };

    const getData=async(data)=>{
        console.log(data,"blocknumber")
        try {
            let getTransactionRecipt =await web3.eth.getBlock(data)
            console.log(getTransactionRecipt,"[[[[[[[[[[[[[[[[[[[[[[[getTransactionDetails]]]]]]]]]]]]]]]]]]]]]]]")
            console.log(getTransactionRecipt.number,"[[[[[[[[[[[[[[[[[[[[[[[getTransactionDetails]]]]]]]]]]]]]]]]]]]]]]]")
            setDetailsData(getTransactionRecipt)
        } catch (error) {
            console.log(error)
        }
    }   

const handleChangeState=()=>{
    navigate('/')
  }

  const getLists=(transactions,blockNumber,timestamp)=>{
    setTransactionLists(transactions)
    console.log(transactions,"details",blockNumber,"time",timestamp)
    navigate('/transactionDetails',{state:{transactions:transactions,blockNumber:blockNumber,timestamp:timestamp}})
    console.log(transactions,"details 2")

}


  return (
    <>
        {
            detailsData!=null ? 
            <>
                 <Card sx={{ display: 'flex',p:2 ,flexDirection:'column',background:"#F8F9FA"}}>
        <ArrowBackIcon onClick={handleChangeState} fontSize="large" sx={{cursor:"pointer"}}/>

        <Box sx={{ flexGrow: 1 }}>
        <div style={{marginLeft:"1.5rem",marginTop:"0.5rem"}}>
            <Typography variant="h5">Transactions Details</Typography>
        </div>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', ml:2}}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Overview" {...a11yProps(0)} />
            <Tab label="Comments" {...a11yProps(1)} />
            </Tabs>
        </Box>
            
        <TabPanel value={value} index={0}>
            <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableBody>
                        
                    <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left">Block Number :</TableCell>
                            <TableCell align="left">{detailsData.number}</TableCell>
                        </TableRow>

                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left"  >Time Stamp :</TableCell>
                            <TableCell align="left">{moment.unix(detailsData.timestamp).format("YYYY-MM-DD h:mm:ss a")}</TableCell>
                        </TableRow>


                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left"  >Transactions :</TableCell>
                            <TableCell align="left"><Button id="btn" variant="outlined" href="#outlined-buttons" size='small' onClick={()=>getLists(detailsData.transactions,detailsData.number,detailsData.timestamp)}>{detailsData.transactions.length} transactions</Button></TableCell>
                        </TableRow>
                        

                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left"  >Difficulty :</TableCell>
                            <TableCell align="left">{detailsData.difficulty}</TableCell>
                        </TableRow>

                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left"  >Total Difficulty :</TableCell>
                            <TableCell align="left">{detailsData.totalDifficulty}</TableCell>
                        </TableRow>

                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left"  >Gas Used :</TableCell>
                            <TableCell align="left">{detailsData.gasUsed}</TableCell>
                        </TableRow>

                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left"  >Gas Limit :</TableCell>
                            <TableCell align="left">{detailsData.gasLimit}</TableCell>
                        </TableRow>

                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left">Extra Data :</TableCell>
                            <TableCell align="left"> 
                            <TextField
                                id="outlined-multiline-flexible"
                                multiline
                                maxRows={4}
                                defaultValue={detailsData.extraData}
                                sx={{width:'50ch'}}
                                InputProps={{
                                    readOnly: true,
                                }}
                                />
                                </TableCell>
                        </TableRow>


                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left"  >Hash :</TableCell>
                            <TableCell align="left">{detailsData.hash}</TableCell>
                        </TableRow>

                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left"  >Parent Hash :</TableCell>
                            <TableCell align="left">{detailsData.parentHash}</TableCell>
                        </TableRow>

                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left"  >Sha3Uncles :</TableCell>
                            <TableCell align="left">{detailsData.sha3Uncles}</TableCell>
                        </TableRow>

                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left" >Nonce :</TableCell>
                            <TableCell align="left">{detailsData.nonce}</TableCell>
                        </TableRow>
                    </TableBody>
            </Table>
            </TableContainer>
        </TabPanel>


        <TabPanel value={value} index={1}>
            <Card sx={{height:"20vh"}}>
            <Typography variant="h6">Make sure to use the "Vote Down" button for any spammy posts, and the "Vote Up" for interesting conversations.</Typography>
            </Card>
        </TabPanel>
        </Box>
    </Card>
            </>
            :
            <div>Loading</div>
        }
    </>
  )
}

export default BlockNumberDetails