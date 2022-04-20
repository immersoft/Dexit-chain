import { Button,Card,Box,TextField,Grid,Typography,CircularProgress } from '@mui/material'
import React, { useEffect,useState } from 'react'
import { useLocation } from 'react-router-dom'
import Connection from '../../../Contract'
import bigInt from 'big-integer'
import loader from '../../../Image/graphics-07.gif'
import { toast, ToastContainer } from "react-toastify";

const ValidatorInfo = () => {
    const location = useLocation()
    const getDetails = location.state.details
    const[delegatorsList,getDelegatorsList]=useState()
    let[account,setAccount]=useState()
    const[loading,setLoading]=useState(false)
    const[transactionSuccess,setTransactionsSuccess]=useState(false)
    const[showAmountWarning,setShowamountWarning]=useState(false);
    const[validatorsDetailsLocal,setValidatorDetailsLocal]=useState()
    // console.log("getdata", getDetails)
    // console.log(validatorsDetailsLocal,"data")
    
    useEffect(()=>{
        listOfActive()
        getValidatorInfoDetails()
    },[])
  
    const listOfActive= async()=>{
        try {
            let listactdata=await Connection.getActiveValidators()
            getDelegatorList(listactdata)
        } catch (error) {
            
        }
    }

    const getDelegatorList=async(list)=>{
        try {

            for(let i=0;i<list.length;i++){
                let listdata=await Connection.getValidatorInfo(list[i])
                // console.log(listdata,"lisssst")
            }

        } catch (error) {
            console.log(error)
        }  
    }

    const getAccounts = async () => {
        try {
            account = await window.ethereum.selectedAddress;
        setAccount(account);
        } 
        catch (error) {
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
    
    useEffect(() => {
      getAccounts();
    },[]);
    // console.log(account,"account")


    const delegateStake=async(details)=>{
        console.log("dklsdhskhdsjk",price);
        if(price <=0){
            console.log("ifff")
            setShowamountWarning(true);
            return null;
        }
        try {
            setLoading(true)

            let stakerAmountData = bigInt(price * 10 ** 18);
            console.log(stakerAmountData.value)
            let deligate=await Connection.stakeDelegator(details.address,{ value:stakerAmountData.value })
            console.log(deligate,"deligate")
            let abc = await deligate.wait();
            if (abc) {
                setLoading(false)
                toast.success('Stake successfull!')
            setShowamountWarning(false);

            }
            setPrice('')
        } catch (error) {
            setLoading(false)
            console.log(error)
            if(error.code===4001){
                toast.error(error.message.split(":").pop())

            }
            else if(error.data.message){
                toast.error(error.data.message)
            }

        }
       
    }

    const [price, setPrice] = React.useState(0);
    // const handleChange = (event) => {
    //   setName(event.target.value);
    // };
    const getValidatorInfoDetails=()=>{
        if(getDetails){
            console.log(getDetails.address.toLowerCase(),"getdetails")
        var requestOptions = {
            method: 'GET',
            redirect: 'follow'
          };
          
          fetch(`https://final-explorer.herokuapp.com/validatorInfo/${getDetails.address.toLowerCase()}`, requestOptions)
            .then(response => response.text())
            .then(result =>{ 
                setValidatorDetailsLocal(JSON.parse(result))
            })
            .catch(error => console.log('error', error));
        }
    }
  

  return (
   <div> 
      <ToastContainer  />

{ loading ?
     <Box sx={{ display: 'flex',justifyContent:"center" ,padding:"10%"}}>
     <div style={{display:"flex",flexDirection:"column",textAlign:"center"}}>
       <img src={loader} width={250} height={120}/>
        <span style={{fontSize:"1.2rem",lineHeight:"0",color:"grey"}}>Please Wait...</span>
        </div>
    </Box>
    :
<>
{getDetails?
    <>
    <Grid container>
        <Grid xs={12} sm={6} md={6}>
        <Typography variant="h4" sx={{textAlign:"center"}}>Validator Details</Typography>
        <Card sx={{ display: 'flex', alignItems: 'center',flexDirection:"column",boxShadow:"none",p:3}}>
            <Box sx={{ flexGrow: 1,'& .MuiTextField-root': { m: 1 ,width:'100%'} }}   
                component="form"
                noValidate
                autoComplete="off">
              
                <TextField
                    id="outlined-name"
                    label="Validator Address"
                    value={getDetails ? getDetails.address:"-"}
                    InputProps={{
                        readOnly: true,
                      }}
                />
                <TextField
                    id="outlined-uncontrolled"
                    label="Total Amount"
                    defaultValue="foo"
                    value={getDetails ? getDetails.amount/1000000000000000000:"-"}
                    InputProps={{
                        readOnly: true,
                      }}
                />

                <TextField
                    id="outlined-uncontrolled"
                    label="Name"
                    value={validatorsDetailsLocal!=undefined ? validatorsDetailsLocal.data.Name:"-"}
                    InputProps={{
                        readOnly: true,
                      }}
                />

                <TextField
                    id="outlined-uncontrolled"
                    label="Description"
                    defaultValue="foo"
                    value={validatorsDetailsLocal!=undefined ? validatorsDetailsLocal.data.Description:"-"}
                    InputProps={{
                        readOnly: true,
                      }}
                />

                <TextField
                    id="outlined-uncontrolled"
                    label="Website"
                    defaultValue="foo"
                    value={validatorsDetailsLocal!=undefined ? validatorsDetailsLocal.data.Website:"-"}
                    InputProps={{
                        readOnly: true,
                      }}
                />

                {/* <TextField
                    id="outlined-uncontrolled"
                    label="Number of Delegators"
                    defaultValue="foo"
                    value={delegatorsList ? Object.keys(delegatorsList).length:"-"}
                    InputProps={{
                        readOnly: true,
                      }}
                /> */}
            </Box>
        </Card>
        </Grid>

        <Grid xs={12} sm={6} md={6}>
        <Typography variant="h4" sx={{textAlign:"center"}}>Delegator Info</Typography>
        <Card sx={{ display: 'flex', alignItems: 'center',boxShadow:"none",p:3}}>
            <Box sx={{ flexGrow: 1 ,'& .MuiTextField-root': { m: 1 ,width:'100%'}}}   
                component="form"
                noValidate
                autoComplete="off">
               
                <TextField
                    id="outlined-name"
                    label="Your Address"
                    value={account ? account:"-"}
                    InputProps={{
                        readOnly: true,
                      }}
                />
                <TextField
                    // fullWidth
                    id="outlined-uncontrolled"
                    label="Amount"
                    defaultValue="foo"
                    value={price}
                    error={showAmountWarning}
                    onChange={(e)=>setPrice(e.target.value)}
                />
                
                <Button variant='outlined' primary sx={{m:1}} onClick={()=>delegateStake(getDetails)}>Delegate</Button>
              
            </Box>
        </Card>
        </Grid>
    </Grid>
    </>
    :"-"
}
    </>
    }
    </div>
  )
}

export default ValidatorInfo