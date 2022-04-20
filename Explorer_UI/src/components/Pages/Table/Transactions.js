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
import { useState ,useEffect} from "react";
import { Avatar, Button, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./Blocks.css";
import "./transactions.css";

export default function Transactions() {
  const navigate = useNavigate();
  const web3 = new Web3();
  // web3.setProvider("http://192.168.1.41:8545");
  web3.setProvider("https://testnet.dexit.network");  

  // web3.setProvider("http://datafeed.dexit.network");

  const [dd, setdd] = useState([]);
  
  useEffect(() => {

Init()    
    return () => {
    }
  }, [])
  

  async function Init() {
    try {
      let bc = [];
      let currentBlock = await web3.eth.getBlockNumber();
      for (let j = currentBlock - 5; j <= currentBlock; j++) {
        let getBlockDetails = await web3.eth.getBlock(j);

        if (getBlockDetails.transactions.length > 0) {
          for (let k = 0; k < getBlockDetails.transactions.length; k++) {
            let getTransactionDetails = await web3.eth.getTransactionReceipt(
              getBlockDetails.transactions[k]
            );
            bc.push(getTransactionDetails);
          }
        }
      }
      setdd([...dd, ...bc]);
    } catch (error) {
      console.log(error);
    }
  }

  // async function searchTransactionByBlock() {
  //   try {
  //     let ab = [];
  //     let tr = await web3.eth.getBlock(searchBlock);
  //     console.log("trrr", tr.transactions);
  //     for (let i = 0; i < tr.transactions.length; i++) {
  //       let getTrans = await web3.eth.getTransaction(tr.transactions[i]);
  //       console.log("transaction", getTrans);
  //       ab.push(getTrans);
  //     }
  //     setdd(ab);
  //     console.log("dd", ab);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // async function searchTransactionByTransactionHash() {
  //   try {
  //     let ab = [];
  //     console.log(searchBlock);
  //     let tr = await web3.eth.getTransaction(searchBlock);
  //     console.log("transaction details are", tr);
  //     ab.push(tr);
  //     setdd(ab);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  const shortenAccountId = (fullStr) => {
    const strLen = 20;
    const separator = "...";

    if (fullStr?.length <= strLen) return fullStr;

    const sepLen = separator.length;
    const charsToShow = strLen - sepLen;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);

    return (
      fullStr?.substr(0, frontChars) +
      separator +
      fullStr?.substr(fullStr?.length - backChars)
    );
  };
  const handleViewAllTxs = () => {
    navigate("/alltransactions");
  };

  const handleTransactionInfo = (transactionHash) => {
    navigate("/hashinfo", { state: { details: transactionHash } });
  };

  return (
    <>
      {console.log("Transactions length", dd.length)}
      <div className="transaction_body">
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 300 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <Typography sx={{ p: 1.7 }}>Latest Transactions</Typography>
              </TableRow>
              <TableRow style={{ background: "whitesmoke" }}>
                <TableCell>Transaction Hash</TableCell>
                <TableCell align="left">Transactions</TableCell>
                {/* <TableCell align="left">To</TableCell> */}
                <TableCell align="left">Block</TableCell>

                {/* <TableCell align="left">Block hash</TableCell> */}
              </TableRow>
            </TableHead>
            {dd.length > 0 ? (
              <TableBody>
                {( dd
                  ).slice(0)
                  .reverse().map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      cursor: "pointer",
                    }}
                    onClick={() => handleTransactionInfo(row.transactionHash)}
                  >
                    <TableCell component="th" scope="row">
                      <span id="block_number">
                        <Avatar sx={{ mr: 1 }}>Tx</Avatar>
                        {shortenAccountId(row.transactionHash)}
                      </span>
                    </TableCell>
                    <TableCell align="left">
                      From{" "}
                      <span style={{ color: "#6F98DB" }}>
                        {shortenAccountId(row.from)}
                      </span>
                      <br />
                      To{" "}
                      <span style={{ color: "#6F98DB" }}>
                        {row.to == null
                          ? shortenAccountId(row.contractAddress)
                          : shortenAccountId(row.to)}
                      </span>
                    </TableCell>
                    <TableCell align="left">{row.blockNumber}</TableCell>

                    {/* <TableCell align="left">{row.to==null ? shortenAccountId(row.contractAddress) : shortenAccountId(row.to)}</TableCell> */}
                    {/* <TableCell align="left">{shortenAccountId(row.blockHash)}</TableCell> */}
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
            onClick={handleViewAllTxs}
          >
            View All Transactions
          </Button>
        </TableContainer>
      </div>
    </>
  );
}
