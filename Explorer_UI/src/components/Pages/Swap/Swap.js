import { Box, Button, Card, FormControl, Grid, MenuItem, Select, TextField, Typography } from '@mui/material'
import React,{useEffect,useState} from 'react'
import SwapCallsIcon from '@mui/icons-material/SwapCalls';
import fromExponential from 'from-exponential';
import Connection from "../../../Deposite";
import bigInt from 'big-integer';
import Web3 from 'web3';
import Web3Token from 'web3-token';
import axios from "axios";
import SwapHistory from './SwapHistory';
import { ToastContainer, toast } from "react-toastify";


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
    const[swapCalled,setSwapCalled]=useState(false)

    const web3 = new Web3();
    web3.setProvider(window.ethereum);  

    const[historyData,setHistoryData]=useState()


    // console.log(Connection,"contract",account)
console.log(account,"account")
    const getAccounts = async () => {
        try {
          account = await window.ethereum.selectedAddress;
          // setAccount(account);
          console.log("printing account in get account : ",account);
        } catch (error) {
          console.log(error);
        }
      };
    
      window.ethereum.on("accountsChanged", function () {
        getAccounts();
      });
    
      useEffect(() => {
        getAccounts();
        getAbc()
      }, []);


      async function getAbc(){
        let web3= new Web3(window.ethereum);
        let ch=await web3.eth.getAccounts();
        console.log("web3",ch )
        setAccount(ch[0])         
    }


    const handleChange = (event) => {
      console.log(event.target.value,"lklklll");
        setFromValue(event.target.value);

        checkChainId(event.target.value)
    };

    const handleToChange = (event) => {
        setToValue(event.target.value);
    };

    const deposite=async(price)=>{
        try {
            console.log(account)
            let valueAmount=bigInt(enteredAmount*10**18)
            let depositeAmount;

            switch(toValue) {
              case 'ETH':
                // code block
                depositeAmount = await Connection.webETH.deposit({value:valueAmount.value})
                break;
              case 'BNB':
                // code block
                depositeAmount = await Connection.webBSC.deposit({value:valueAmount.value})
                break;
              case 'DXT':
                // code block
                depositeAmount = await Connection.webDXT.deposit({value:valueAmount.value})
                break;
              default:
                // code block
            }
            
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

    const withdrawApi= async (hash,amount)=>{
      console.log(toValue,"called")
        // var myHeaders = new Headers();
        // myHeaders.append("Content-Type", "application/json");
        console.log("printing account : ",account);
        var data = {
          "from": account,
          "amount": parseInt(amount),
          "exc_rate": 1,
          "transactionHash": hash,
          "network":fromValue,
        };
        console.log("printing data : ",data);
        // var raw = await JSON.stringify(data);
        // console.log("printing raw : ",raw);
        // var requestOptions = {
        //   method: 'POST',
        //   headers: myHeaders,
        //   body: raw,
        //   redirect: 'follow'
        // };

        // fetch("https://dxt-explorer.herokuapp.com/withdraw", requestOptions)
        // .then(response => response.text())
        // .then(result => console.log(result))
        // .catch(error => console.log('error', error));
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        const address = (await web3.eth.getAccounts())[0];
        const token = await Web3Token.sign(msg => web3.eth.personal.sign(msg, address), '1d');
        switch(toValue) {
          case 'ETH':
            // code block
            console.log ("insite ETH");
            // attaching token to axios authorization header
            axios.post('https://swapping-api.herokuapp.com/withdraw/ETH',  data , {
            // axios.post('http://localhost:5000/withdraw/ETH',  data , {
              headers: {
                'Authorization': token,
              }
            })
          break;
          case 'BNB':
            // code block
            // axios.post('http://localhost:5000/withdraw/BSC', data, {
            axios.post('https://swapping-api.herokuapp.com/withdraw/BSC', data, {
              headers: {
                'Authorization': token,
              }
            })
          break;
          case 'DXT':
            // code block
            // axios.post('http://localhost:5000/withdraw/DXT', data, {
            axios.post('https://swapping-api.herokuapp.com/withdraw/DXT', data, {
              headers: {
                'Authorization': token,
              }
            })
          break;
          default:
            // code block
            console.log("choose valid token");
        }
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
        // getHistory()
        fetchBNBDetails()
        fetchETHDetails()
        fetchDXTDetails()
        checkChainId()
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
    setSwapCalled(!swapCalled)
}


    const getHistory=()=>{
      var requestOptions = {
          method: 'GET',
          redirect: 'follow'
        };
        
        fetch("http://localhost:5000/withdraw/recover", requestOptions)
          .then(response => response.text())
          .then(result => {
              setHistoryData(JSON.parse(result))
              console.log(JSON.parse(result))
          })
          .catch(error => console.log('error', error));
    }

    const checkChainId=async(value)=>{
      console.log("callled",value)
      if(!value){
        return "";
      }
      var network = 0;
      network = await web3.eth.net.getId().then(function(result) {
        console.log(result);
        if(value=="DXT" && result=="899"){
          console.log("inside if" ,result)
        }

       else if(value=="ETH" && result=="4"){
          // if(result=="1" || result=="4"){
          console.log("eth if condition",result)
          // }
        }

       else if(value=="BNB" && result=='97'){
          // if(result=="56" || result=="97"){
          console.log("eth if condition",result)
          // }
        }
        else{
          console.log("else condition")
          toast.error("Wrong Network");
        }
        return result;
      });
      console.log(network,"network")
    }

  // useEffect(()=>{
  //   if(fromValue==='DXT'){
  //     var network = 0;
  //     network = await eth.net.getId();
  //   }

  // },[fromValue])

  return (
    <>
      <ToastContainer />

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
        <div>
          <SwapHistory historyDataAll={historyData} swapCalled={swapCalled}/>
        </div>
    </>
  )
}

export default Swap