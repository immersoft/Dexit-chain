import { Box, Card, Button,Divider, Grid, List, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, TextField, Tabs, Tab } from '@mui/material'
import React,{useState} from 'react'
// import './singleTransaction.css'
import moment from "moment";
import { Details } from '@mui/icons-material';
import { useNavigate,useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PropTypes from 'prop-types';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

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
  

const SearchBlock = () => {
    const [transactionLists,setTransactionLists]=useState()
    const navigate=useNavigate()
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
      setValue(newValue);
    };
    const getLists=(transactions,blockNumber,timestamp)=>{
        setTransactionLists(transactions)
        console.log(transactions,"details",blockNumber,"time",timestamp)
        navigate('/transactionDetails',{state:{transactions:transactions,blockNumber:blockNumber,timestamp:timestamp}})
        console.log(transactions,"details 2")

    }

    const location = useLocation();
    // const [getSingleBlock,setSingleBlock]=useState()
    // setSingleBlock(location.state.row)
    // console.log(location.state.row)
    const singleBlock=location.state.blockDetails
    console.log(singleBlock, "single block component")
    console.log(singleBlock.number, "single block component")

    const handleChangeState=()=>{
        navigate('/')
      }

  return (
    <>
     
    {singleBlock ?
    
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
                            <TableCell align="left">{singleBlock.number}</TableCell>
                        </TableRow>

                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left"  >Time Stamp :</TableCell>
                            <TableCell align="left">{moment.unix(singleBlock.timestamp).format("YYYY-MM-DD h:mm:ss a")}</TableCell>
                        </TableRow>


                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left"  >Transactions :</TableCell>
                            <TableCell align="left"><Button id="btn" variant="outlined"  size='small' onClick={()=>getLists(singleBlock.transactions,singleBlock.number,singleBlock.timestamp)}>{singleBlock.transactions.length} transactions</Button></TableCell>
                        </TableRow>
                        

                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left"  >Validated by :</TableCell>
                            <TableCell align="left">{singleBlock.miner}</TableCell>
                        </TableRow>

                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left"  >Difficulty :</TableCell>
                            <TableCell align="left">{singleBlock.difficulty}</TableCell>
                        </TableRow>

                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left"  >Total Difficulty :</TableCell>
                            <TableCell align="left">{singleBlock.totalDifficulty}</TableCell>
                        </TableRow>

                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left"  >Gas Used :</TableCell>
                            <TableCell align="left">{singleBlock.gasUsed}</TableCell>
                        </TableRow>

                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left"  >Gas Limit :</TableCell>
                            <TableCell align="left">{singleBlock.gasLimit}</TableCell>
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
                                defaultValue={singleBlock.extraData}
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
                            <TableCell align="left">{singleBlock.hash}</TableCell>
                        </TableRow>

                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left"  >Parent Hash :</TableCell>
                            <TableCell align="left">{singleBlock.parentHash}</TableCell>
                        </TableRow>

                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left"  >Sha3Uncles :</TableCell>
                            <TableCell align="left">{singleBlock.sha3Uncles}</TableCell>
                        </TableRow>

                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left" >Nonce :</TableCell>
                            <TableCell align="left">{singleBlock.nonce}</TableCell>
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
    :
    "not get"
    }
    </>
  )
}

export default SearchBlock