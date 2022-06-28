import { Button, Card, Grid, TextareaAutosize, TextField, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React,{useEffect, useState} from 'react'
import Web3 from 'web3'
import './tokendeploy.css'
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import { ToastContainer, toast } from "react-toastify";


const Item = styled(Paper)(({ theme }) => ({
  // backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  // ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  boxShadow: 'none',
}));

const TokenDeploy = () => {
    const[textInput,setTextInput]=useState('')
    const[byteCode,setByteCode]=useState()
    const[newversionData,setnewVersionData]=useState()
    const[deployedAddress,setDeployedAddress]=useState()
    const[compileContract,setCompileContract]=useState()

    // const provider = new HdWalletProvider(
    //   "six dawn reform guilt worth already obvious young day zone gesture motion",
    //   "https://rinkeby.infura.io/v3/473157ee68774549952f5b3a2e97559b"
    // );

    const web3 = new Web3(window.ethereum);

    const codeDeploy=()=>{
      if(textInput!=undefined){
      var formdata = new FormData();
      formdata.append("code",textInput)

      var requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
      };

      fetch("http://localhost:5000/upload", requestOptions)
        .then(response => response.text())
        .then(result => {console.log(result)
          console.log(typeof(result))
          setByteCode(result)
          outputData(result)
        })
        .catch(error => console.log('error', error));
    }
  }


  const newVersion=()=>{
    var formdata = new FormData();
  formdata.append("code", textInput);

  var requestOptions = {
    method: 'POST',
    body: formdata,
    redirect: 'follow'
  };

  fetch("http://localhost:5000/writeFile", requestOptions)
  .then(response =>{ response.text()
    if(response.status==200){
      console.log("success")
      compileCode()
    }
  })
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
  }


  const compileCode=()=>{
    var requestOptions = {
      method: 'POST',
      redirect: 'follow'
    };
    
    fetch("http://localhost:5000/newversion", requestOptions)
      .then(response => response.text())
      .then(result => {console.log(JSON.parse(result))
        outputData(result)
      })
      .catch(error => console.log('error', error));
  }

  const outputData=(result)=>{

    const dataget=JSON.parse(result)
    const getDataPass=Object.keys(dataget.data)[0]
    
    console.log(dataget.data[getDataPass],"oooooo")
    setnewVersionData(JSON.stringify(dataget.data[getDataPass].abi))
    deploy(dataget.data[getDataPass])

    // const result=Object.keys(LotteryContract)[0];
    // const newData=JSON.parse(dataget.data)
    // console.log(newData)
      // console.log(JSON.parse(JSON.stringify(result)),"called")
      // console.log(JSON.parse(JSON.stringify(result)),"called2")
  }
   
  
  const deploy = async (data) => {
    try {
      console.log(data,"datatat")
      console.log(data.abi,"datatat")
      // Get The Accounts
      console.log("deploy called")
      const accounts = await web3.eth.getAccounts();
      console.log(accounts,"l;l;l");
      // console.log("Attempting to Deploy Contract from :", accounts[0])
      // Use Account to Deploy The Contract
      // factory = await new web3.eth.Contract(JSON.parse(compiledFactory).interface)
      // .deploy({ data: (compiledFactory).bytecode })
      // .send({ from: accounts[0], gas: '1000000' });
      const deployed=JSON.stringify(data)

      const lottery = await new web3.eth.Contract(data.abi)
        .deploy({ data: data.evm.bytecode.object })
        .send({ from: accounts[0], gas: "1000000" });
        //console.log(interface);
        // const waiting=lottery.wait()
        // if(waiting){
      console.log("Contract Deployed To:", lottery);
      setDeployedAddress(lottery.options.address)
      console.log("Contract Deployed To:", lottery.options.address);
        }
        // } 
    catch (error) {
      console.log(error)
    }
   
  };

  const copyAbi=(abi)=>{
    navigator.clipboard.writeText(abi? abi:"");
    // alert("Hash Copied")
    toast.success('Abi Copied!')
  }

 

  return (
    <>
    <ToastContainer />
    <Card sx={{boxShadow:"none !important"}}>
        <Box sx={{flexGrow:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <TextField
          id="outlined-multiline-static"
          multiline
          rows={22}
          fullWidth
          sx={{width:1000}}
          value={textInput}
          onChange={(e)=>setTextInput(e.target.value)}
        />
        </Box>

        <div style={{display:"flex",justifyContent:"center",marginTop:"1rem"}}>
            <Button variant="contained" size='large' onClick={newVersion}>Compile</Button>
        </div>

        <Grid container>
          <Grid xs={12} md={6}>
            <Item>
              <Typography variant='h4'>ABI of compile contract</Typography>
              <TextField
            id="outlined-multiline-static"
            multiline
            fullWidth
            sx={{width:500}}
            value={newversionData ? newversionData : ""}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <CopyAllIcon fontSize='large' sx={{cursor:"pointer"}} onClick={()=>copyAbi(newversionData)}/>
                </InputAdornment>
              ),
            }}
          />
            </Item>
          </Grid>

          <Grid xs={12} md={6}>
            <Item>
            <Typography variant='h4'>Address of compile contract</Typography>
              <TextField
              id="outlined-multiline-static"
              multiline
              fullWidth
              sx={{width:500}}
              value={deployedAddress ? deployedAddress : ""}
            />
            </Item>
          </Grid>
        </Grid>

        {/* <div className='output'>
        <TextField
          id="outlined-multiline-static"
          multiline
          rows={22}
          fullWidth
          sx={{width:500}}
          value={newversionData ? newversionData.metadata : ""}
        />
        </div> */}
    </Card>
    </>
  )
}

export default TokenDeploy