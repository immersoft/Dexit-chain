import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Web3 from "web3";
import { useState, useEffect } from "react";
import {
  Avatar,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import moment from "moment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "./singleTransaction.css";
import { useNavigate } from "react-router-dom";
import './Blocks.css'





export default function Blocks() {

  const web3 = new Web3();
  // web3.setProvider("https://datafeed.dexit.network");
  // web3.setProvider("https://testnet.dexit.network");  

web3.setProvider("https://datafeed.dexit.network");
  const navigate = useNavigate();
  const [dd, setdd] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const[callFunction,setCallFunction]=useState(true)


  useEffect(() => {
      Init();
  }, []);


  async function Init() {
    try {
      let bc = [];
  
      let currentBlock = await web3.eth.getBlockNumber();
      setCallFunction(!callFunction)
      for (let j = currentBlock - 5; j <=currentBlock; j++) {
        let getBlockDetails = await web3.eth.getBlock(j);
        bc.push(getBlockDetails);
      }
      setdd([...dd, ...bc]);
    } catch (error) {
      console.log(error);
    }
   
  }


  const singleTransactionDetails = (row) => {
    setShowDetails(true);
    navigate("/singledetails", { state: { row: row } });
  };

  const handleChangeState = () => {
    setShowDetails(false);
  };

  const shortenAccountId = (fullStr) => {
    const strLen = 20;
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

  const handleViewAllBlocks = () => {
    navigate("/allblocks");
  };

  return (
    <>
      {!showDetails ? (
        <div>
          {/* <h1>Block Details</h1> */}
          {/* <Input
          type="number"
          placeholder="Search block"
          onChange={(e) => setSearchBlock(e.target.value)}
        />
        <Button
          variant="outlined"
          onClick={searchTransactionByBlock}
          sx={{ ml: 2 }}
        >
          Search
        </Button> */}
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 300 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <Typography sx={{ p: 1.7 }}>Latest Blocks</Typography>
                </TableRow>
                <TableRow style={{ background: "whitesmoke" }}>
                  <TableCell align="left">Number</TableCell>
                  <TableCell align="left">Hash</TableCell>
                  {/* <TableCell align="center">Transactions</TableCell> */}
                  <TableCell align="left">Timestamp</TableCell>
                </TableRow>
              </TableHead>
              {dd.length > 0 ? (
                <TableBody>
                  {( dd
                  ).slice(0)
                  .reverse()
                  .map((row, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        cursor: "pointer",
                      }}
                      onClick={() => singleTransactionDetails(row)}
                    >
                      <TableCell align="left">
                        <span id="block_number">
                          <Avatar sx={{ mr: 1 }}>Bk</Avatar>
                          {row.number}
                        </span>
                      </TableCell>
                      <TableCell align="left">
                        {shortenAccountId(row.hash)}
                      </TableCell>
                      {/* <TableCell align="center">{row.transactions}</TableCell> */}
                      <TableCell align="left">
                        {moment
                          .unix(row.timestamp)
                          .format("YYYY-MM-DD h:mm:ss a")}
                      </TableCell>
                      {/* {console.log(moment.unix(row.timestamp).format("YYYY-MM-DD h:mm:ss a"))} */}
                    </TableRow>
                  ))}
                
                </TableBody>
              ) : (
                <TableRow align="center">
                  <TableCell colSpan={12} align="center">
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              )}{" "}
             </Table>
            <Button
              className="blocksBtn"
              variant="contained"
              color="grey"
              fullWidth
              sx={{ mr: 2, ml: 2, mb: 3, width: "96%" }}
              onClick={handleViewAllBlocks}
            >
              View All Blocks
            </Button>
          </TableContainer>
        </div>
      ) : (
        <div className="single_block">
          <ArrowBackIcon
            onClick={handleChangeState}
            fontSize="large"
            sx={{ mt: 3 }}
          />
        </div>
      )}
    </>
  );
}
