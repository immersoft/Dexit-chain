import { Box, Button, Card, FormControl, Grid, MenuItem, Select, TextField, Typography } from '@mui/material'
import React,{useEffect,useState} from 'react'
import SwapCallsIcon from '@mui/icons-material/SwapCalls';
import fromExponential from 'from-exponential';
import Connection from "../../../Deposite";
import bigInt from 'big-integer';
import Web3 from 'web3';

const Swap = () => {
    const [fromValue, setFromValue] = React.useState('');
    const [toValue, setToValue] = React.useState('');
    const[enteredAmount,setEnteredAmount]=React.useState(0)
    const[swapAmount,setSwapAmount]=React.useState(0)
    const[dxtUSDPrice,setDxtUSDPrice]=useState()
    const[ethPrice,setEthPrice]=useState()
    const[bnbPrice,setBnbPrice]=useState()
    const[ethbnbPrice,setETHBnbPrice]=useState()
    const[ethusdPrice,setETHUsdPrice]=useState()
    const[bnbethPrice,setBNBETHPrice]=useState()
    const[bnbUSDPrice,setBNBUSDPrice]=useState()
    let [account, setAccount] = useState("");
    const web3 = new Web3();

    // console.log(Connection,"contract",account)

    const getAccounts = async () => {
        try {
          account = await window.ethereum.selectedAddress;
          setAccount(account);
        } catch (error) {
          console.log(error);
        }
      };
    
      window.ethereum.on("accountsChanged", function () {
        getAccounts();
      });
    
      useEffect(() => {
        getAccounts();
      }, []);

    const handleChange = (event) => {
        setFromValue(event.target.value);
    };

    const handleToChange = (event) => {
        setToValue(event.target.value);
    };

    const deposite=async(price)=>{
        try {
            console.log(account)
            let valueAmount=bigInt(enteredAmount*10**18)
            let depositeAmount=await Connection.deposit({value:valueAmount.value})
            console.log(depositeAmount,"depositeAmount")
            console.log(swapAmount,"swapAmount")
            let abc=await depositeAmount.wait()
            if(abc){
                // console.log(depositeAmount.hash)
                // console.log(swapAmount,"swapAmount",price)
                let amountConverted=web3.utils.toWei(price.toString())
                withdrawApi(depositeAmount.hash,amountConverted)
                console.log(amountConverted,"amountConverted")
            }
        } 
        catch (error) {
            console.log(error);
        }
       
    }

    const withdrawApi=(hash,amount)=>{
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
        "account": account,
        "amount": parseInt(amount),
        "exc_rate": 1,
        "txn_hash": hash,
        });

        var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
        };

        fetch("https://dxt-explorer.herokuapp.com/withdraw", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
            }

    async function fetchBNBDetails() {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/binancecoin"
        );
        if (response.status === 200) {
          const res = await response.json();
          console.log(res,"response")
          setBNBETHPrice(res.market_data.current_price.eth)
          setBNBUSDPrice(res.market_data.current_price.usd)
        }
      }

    async function fetchETHDetails() {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/ethereum"
        );
        if (response.status === 200) {
          const res = await response.json();
          console.log(res,"response")
          setETHBnbPrice(res.market_data.current_price.bnb)
          setETHUsdPrice(res.market_data.current_price.usd)
        }
      }

    async function fetchDXTDetails() {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/dexit-finance"
        );
        if (response.status === 200) {
          const res = await response.json();
          console.log(res,"response")
          setDxtUSDPrice(res.market_data.current_price.usd)
          setEthPrice(res.market_data.current_price.eth)
          setBnbPrice(res.market_data.current_price.bnb)
        }
      }

    useEffect(()=>{
        fetchBNBDetails()
        fetchETHDetails()
        fetchDXTDetails()
        // swapValue()
    },[])

    const swapValue=()=>{
        let finalAmount=enteredAmount
    if(fromValue==='DXT'){
        if(toValue=="ETH"){
            let ethPrices=fromExponential(ethPrice)
            finalAmount=enteredAmount*ethPrices
            // setSwapAmount(fromExponential(finalAmount))
        }
        if(toValue=="BNB"){
            finalAmount=enteredAmount*bnbPrice
            console.log(finalAmount,"kllll")
        }
        if(toValue=="USD"){
            finalAmount=enteredAmount*dxtUSDPrice
            console.log(finalAmount,"kjjjllll")

        }
    }

    if(fromValue==='ETH'){
        console.log(fromValue,"fromvalue")
        if(toValue=="DXT"){
            let ethpriceconvert=fromExponential(ethPrice)
            finalAmount=Math.floor(enteredAmount/ethpriceconvert)
            console.log(Math.floor(finalAmount),"kllll")
        }

        if(toValue=="BNB"){
            finalAmount=ethbnbPrice
        }

        if(toValue=="USD"){
            finalAmount=ethusdPrice
        }
        
    }

    if(fromValue==='BNB'){
        console.log(fromValue,"fromvalue")
        if(toValue=="DXT"){
            let ethpriceconvert=fromExponential(bnbPrice)
            finalAmount=Math.floor(enteredAmount/ethpriceconvert)
            console.log(Math.floor(finalAmount),"kllll")
        }

        if(toValue=="ETH"){
            finalAmount=bnbethPrice
        }

        if(toValue=="USD"){
            finalAmount=bnbUSDPrice
        }
        
    }
    
    setSwapAmount(fromExponential(finalAmount))
    deposite(fromExponential(finalAmount))
}


   

  return (
    <>
     <div
        className="stack_modal"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Card sx={{ p: 2, boxShadow: "none", width: "600px"}}>
          <Box sx={{ flexGrow: 1, boxShadow: 3 }} p={3}>
            <Typography variant="h4" sx={{ textAlign: "center" }}>
              Swap
            </Typography>
            <Grid container sx={{mt:2}}>
                <Grid item xs={6} md={7} sx={{display:"flex",justifyContent:"center"}}>
                    <TextField
                    id="outlined-basic"
                    label="Amount"
                    variant="outlined"
                    value={enteredAmount}
                    onChange={(e)=>setEnteredAmount(e.target.value)}
                />
                </Grid>
                <Grid item xs={6} md={5} sx={{display:"flex",justifyContent:"center"}}>
                <FormControl>
                    <Select
                    value={fromValue}
                    onChange={handleChange}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label' }}
                    >
                    <MenuItem value="">
                        <em>Select</em>
                    </MenuItem>
                    {/* <MenuItem value={10}>ETH</MenuItem>
                    <MenuItem value={20}>BNB</MenuItem> */}
                    <MenuItem value='DXT'>DXT</MenuItem>
                    <MenuItem value='ETH'>ETH</MenuItem>
                    <MenuItem value='BNB'>BNB</MenuItem>
                    </Select>
                </FormControl>
                </Grid>
            </Grid>

            <Grid container sx={{mt:2}}>
                <Grid xs={12} md={12} sx={{display:"flex",justifyContent:"center"}}>
                    <SwapCallsIcon  sx={{fontSize:'4rem'}}/>
                </Grid>
            </Grid>

            <Grid container sx={{mt:2}}>
                <Grid item xs={6} md={7} sx={{display:"flex",justifyContent:"center"}}>
                    <TextField
                    id="outlined-basic"
                    label="Amount"
                    variant="outlined"
                    value={swapAmount}
                    // onChange={(e)=>setSwapAmount(e.target.value)}
                />
                </Grid>
                <Grid item xs={6} md={5} sx={{display:"flex",justifyContent:"center"}}>
                <FormControl>
                    <Select
                    value={toValue}
                    onChange={handleToChange}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label' }}
                    >
                    <MenuItem value="">
                        <em>Select</em>
                    </MenuItem>
                    <MenuItem value='ETH'>ETH</MenuItem>
                    <MenuItem value='BNB'>BNB</MenuItem>
                    <MenuItem value='USD'>USD</MenuItem>
                    <MenuItem value='DXT'>DXT</MenuItem>
                    </Select>
                </FormControl>
                </Grid>
            </Grid>


            <Grid container sx={{mt:2}}>
                <Grid xs={12} md={12} sx={{display:"flex",justifyContent:"center"}}>
                    <Button variant="contained" onClick={swapValue}>Swap</Button>
                </Grid>
            </Grid>
          </Box>
        </Card>
      </div>

    </>
  )
}

export default Swap