import {
    Button,
    TextField,
    Card,
    Box,
    Divider,
    Typography,
    Grid,
    Alert,
    Snackbar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Modal,
    Fade,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    CircularProgress,
  } from "@mui/material";
  import LoadingButton from "@mui/lab/LoadingButton";
  import { useTheme } from "@mui/material/styles";
  import OutlinedInput from "@mui/material/OutlinedInput";
  import React, { useState, useEffect } from "react";
  import Proposal from "../../../Contract";
  import bigInt from "big-integer";
  import Paper from "@mui/material/Paper";
  import Web3 from 'web3';
  import axios from "axios";
  import Web3Token from 'web3-token';

  import { styled } from "@mui/material/styles";
  import ContentCopyIcon from "@mui/icons-material/ContentCopy";
  import { ToastContainer, toast } from "react-toastify";
  import Backdrop from '@mui/material/Backdrop';
  
  
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };
  
  
  const columns = [
    { id: "from", label: "From", minWidth: 50 },
    { id: "amount", label: "Amount", minWidth: 50 },
    { id: "status", label: "Status", minWidth: 50 },
    { id: "network", label: "Network", minWidth: 50 },
    { id: "txnhash", label: "Txn Hash", minWidth: 50 },
    { id: "claim", label: "Claim", minWidth: 50 }
  ];
  
  
  export default function SwapHistory({historyDataAll}) {
  
    const[allInfo,setAllInfo]=useState()
    const[historyData,setHistoryData]=useState()
    let [account, setAccount] = useState("");
    const[sortedData,setSortedData]=useState()

    const getAccounts = async () => {
        try {
          account = await window.ethereum.selectedAddress;
          setAccount(account);
        } catch (error) {
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


    const getPastHistory=()=>{
        var requestOptions = {
            method: 'GET',
            redirect: 'follow'
          };
          
          fetch("http://localhost:5000/withdraw/recover/0xe49d9e71bc14552e5a4c4708e5c7c410a269d4c9", requestOptions)
            .then(response => response.text())
            .then(result => {console.log(JSON.parse(result))
                setSortedData(JSON.parse(result))
            })
            .catch(error => console.log('error', error));
    }

    const withdrawApi= async (item)=>{
        console.log(item,"itemj")
          var data = {
            "from": item.from,
            "amount": parseInt(item.amount),
            "exc_rate": item.exc_rate,
            "transactionHash": item.transactionHash,
            "network":item.network
          };
        //   console.log("printing data : ",data);
          const web3 = new Web3(window.ethereum);
          await window.ethereum.enable();
          const address = (await web3.eth.getAccounts())[0];
          const token = await Web3Token.sign(msg => web3.eth.personal.sign(msg, address), '1d');
          switch(item.network) {
            case 'ETH':
              // code block
              console.log ("insite ETH");
              // attaching token to axios authorization header
              axios.post('http://localhost:5000/withdraw/ETH',  data , {
                headers: {
                  'Authorization': token,
                }
              })
            break;
            case 'BNB':
              // code block
              axios.post('http://localhost:5000/withdraw/BSC', data, {
                headers: {
                  'Authorization': token,
                }
              })
            break;
            case 'DXT':
              // code block
              axios.post('http://localhost:5000/withdraw/DXT', data, {
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

    useEffect(()=>{
        // getHistory()
        getPastHistory()
    },[])



    const copyHash = (val) => {
      console.log("side");
      navigator.clipboard.writeText(val);
    };
  
    const shortenAccountId = (fullStr) => {
      const strLen = 40;
      const separator = "...";
  
      if (fullStr?.length <= strLen) return fullStr;
  
      const sepLen = separator.length;
      const charsToShow = strLen - sepLen;
      const frontChars = Math.ceil(charsToShow / 3);
      const backChars = Math.floor(charsToShow / 3);
  
      return (
        fullStr?.substr(0, frontChars) +
        separator +
        fullStr?.substr(fullStr?.length - backChars)
      );
    };
  
    return (
      <>
      <Grid container display={"flex"} justifyContent="center" sx={{p:2}}>
        <Grid xs={12} sm={12} md={12} >
          <Card sx={{ mt: 3,   px: 3 ,background:'#F8FAFD'}} item>
            <Box sx={{ flexFlow: 1, p: 2 }}>
              <Typography variant="h5" pb={2} sx={{ textAlign: "center" }}>
                History
              </Typography>
              <Divider />
  
                {sortedData !=undefined?
              <Grid container sx={{pl:3,pr:3}}>
                <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650, p: 2 }} aria-label="simple table">
                    <TableHead>
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
                    {sortedData ? sortedData.transactions.map((item,index)=>{
                      return(
                        // <>
                        // {item.from ==account ?
                        <TableRow>
                        <TableCell>
                            {item.from}
                        </TableCell>
                      
                        <TableCell>
                            {item.amount/1000000000000000000}
                        </TableCell>

                        <TableCell>
                        {item.tx_status}
                        </TableCell>

                        <TableCell>
                        {item.network}
                        </TableCell>

                        <TableCell>
                        {shortenAccountId(item.transactionHash)}
                        </TableCell>

                        <TableCell>
                      {item.tx_status=="200" || item.tx_status=="ok"?
                      <Button
                      variant="outlined"
                      disabled
                    //   onClick={() => withdrawApi(item)}

                    >
                      Claim
                    </Button>
                     
                     :
                     <Button
                     variant="outlined"
                     onClick={() => withdrawApi(item)}
                   >
                     Claim
                   </Button>
                }
                       
                        </TableCell>

                    </TableRow>
                    // :
                    // <div style={{textAlign:"center",margin:"15%"}}>
                    //     <Typography variant="h5">No Transaction Found</Typography>
                    // </div>
                    // }
                        
                    //     </>
                      )
                    }):
  
                    <div style={{textAlign:"center",margin:"15%"}}>
                      <Typography variant="h5">No Transaction Found</Typography>
                    </div>
                  }
                  
                  </TableBody>
                </Table> 
          </TableContainer>
              </Grid>
  
              :
              <>           
               <div className="voting_loader">
                <Box>
                  <CircularProgress />
                </Box>
              </div>
              </>
            }
            </Box>
          </Card>
        </Grid>
      </Grid>
      </>
    );
  }
  