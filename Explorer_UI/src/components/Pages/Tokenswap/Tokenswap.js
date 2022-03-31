import bigInt from 'big-integer'

import * as React from 'react';
import { useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Swap from './tokenswapcontracts/swapContract';
const axios = require("axios");



function Tokenswap() {
  const [currency, setCurrency] = React.useState('');
  const [textValue, setTextValue] = React.useState(0);
  const [firstvalue, setFirstvalue] = React.useState(0);
  const [secondValue, setSecondValue] = React.useState(0);
  const [result, setresult] = React.useState(0);
  const [ex_rate, setex_rate] = React.useState(0);
  
  const handleChange = (event) => {
    setCurrency(event.target.value);
  };
  useEffect(() => {


    console.log("text is =", textValue)
    return () => {

    }
  }, [textValue,firstvalue,secondValue])

  const deposit = async () => {
    console.log("Swap",Swap)
    console.log("abcc-----",textValue)
    let ethValue=bigInt(textValue*10**18);
    console.log("ababba---1111",ethValue)

    try {
      let depositResult = await Swap.deposit({
        value: ethValue.value
      });

      let account = depositResult.from;
      let amount = result;
      let exc_rate = ex_rate;
      let txn_hash = depositResult.hash;
      let data = {
        account,
        amount,
        exc_rate,
        txn_hash
      }
      console.log("data : ",data);
      axios.post("https://dxt-explorer.herokuapp.com/withdraw",data)
      .then(res => console.log(res))
      .catch(error => console.log("error",error));

      console.log("Deposit called ", depositResult);
      console.log("Deposit called ", depositResult.from);
      console.log("Deposit called ", depositResult.hash);


    } catch (error) {
      console.log(error);
    }
  };

  const SwapFunction = (e) => {
  setTextValue(e)
    console.log("swap is here",e);
    let apidata = fetch('https://api.coingecko.com/api/v3/coins/dexit-finance');
    let eth = fetch('https://api.coingecko.com/api/v3/coins/ethereum');

    eth.then((response) => {
      return response.json();
    })
      .then((ethUsd) => {
        console.log("eth", ethUsd)
        console.log(ethUsd.market_data.current_price.usd, "eth");

        // let ex_rate=ethUsd.market_data.current_price.usd;
        
       
        setFirstvalue(ethUsd.market_data.current_price.usd)
        apidata.then((response) => {
          return response.json();
        })
          .then((dxtUsd) => {
            console.log("json", dxtUsd)
            console.log(ethUsd.market_data.current_price.usd, "eth to usd");
            console.log(dxtUsd.market_data.current_price.usd, "dxt");
            setSecondValue(1 / dxtUsd.market_data.current_price.usd)
            setresult((ethUsd.market_data.current_price.usd * e) * 1 / dxtUsd.market_data.current_price.usd);
            setex_rate((ethUsd.market_data.current_price.usd  * (1 / dxtUsd.market_data.current_price.usd)));
            console.log("ex_rate : ",ex_rate);
            console.log("resss", (ethUsd.market_data.current_price.usd * e) * 1 / dxtUsd.market_data.current_price.usd)
          });
   
      });  
  }


  return (
    <div className="App" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", paddingTop: '100px' }}>

      <div style={{ display: "flex" }} >
        <Box sx={{ minWidth: 120, maxHeight: 30 }}>
          <FormControl sx={{ width: 100 }} size="small">


            <InputLabel id="demo-simple-select-label">select token</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={currency}
              label="currency"
              onChange={handleChange}
            >
              <MenuItem value={10}>ETH</MenuItem>
              <MenuItem value={20}>DXT</MenuItem>
              <MenuItem value={30}>BNB</MenuItem>
            </Select>

          </FormControl>

        </Box>

        <TextField id="outlined-basic" label="Enter amount" value={textValue} onChange={(e) => { SwapFunction(e.target.value) }}   variant="outlined" type="number" pattern="[0-9]*" size="small" >

        </TextField>

      </div>


      <div style={{ paddingTop: '20px' }}>
        <Button className="buttonbox" variant="contained" endIcon={<SwapVertIcon />} onClick={deposit}>
          SWAP
        </Button>

      </div >



      <div style={{ display: "flex", paddingTop: '20px' }} >
        <Box sx={{ minWidth: 120, maxHeight: 30 }}>
          <FormControl sx={{ width: 100 }} size="small">


            <InputLabel id="demo-simple-select-label">select token</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={currency}
              label="currency"
              onChange={handleChange}
            >
              <MenuItem value={10}>ETH</MenuItem>
              <MenuItem value={20}>DXT</MenuItem>
              <MenuItem value={30}>BNB</MenuItem>
            </Select>

          </FormControl>

        </Box>

        <TextField id="outlined-basic" label="Enter amount" value={result} variant="outlined" type="number" pattern="[0-9]*" size="small" >

        </TextField>

      </div>

    </div>
  );
}

export default Tokenswap;