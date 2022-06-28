import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Card } from '@mui/material';
import AccountDetails from './AccountDetails';
import Web3 from "web3";


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
        <Box >
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

export default function BalanceTab({address}) {
  const [value, setValue] = React.useState(0);
  const web3 = new Web3();
  // web3.setProvider("https://testnet.dexit.network");  
  web3.setProvider("https://datafeed.dexit.network");  

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  console.log(address,"balance tab")

  const getDetails=async()=>{
      try {
        let currentBlockNumber=await web3.eth.getBlockNumber()
        // let getDetails=await web3.eth.getProof(
        //     // fromBlock:0,
        //     // toBlock:currentBlockNumber,
        //     address);

        let getDetails=await web3.eth.filter(address);
        console.log(getDetails,"getDetailsinfo");
      } catch (error) {
          console.log(error)
      }
    
  }


  

  React.useEffect(()=>{
    getDetails()
  },[])

  return (
        <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                <Tab label="Transactions" {...a11yProps(0)} />
                <Tab label="Comments" {...a11yProps(1)} />
            </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
            <AccountDetails/>
        </TabPanel>
        <TabPanel value={value} index={1}>
            Item Two
        </TabPanel>
        <TabPanel value={value} index={2}>
            Item Three
        </TabPanel>
        </Box>
  );
}
