import * as React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import Web3 from "web3";
import { useState, useEffect } from "react";
import { Avatar, Button, CircularProgress, Grid, Input, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowCircleRightRoundedIcon from '@mui/icons-material/ArrowCircleRightRounded';
import Header3 from "../../Header/Header3";
import moment  from 'moment'
import SearchBox from "../Home/SearchBox";
import dexitLogo from "../../../Image/graphics-06.png";


function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

export default function AllTransactions() {
  const navigate = useNavigate();
  // const web3 = new Web3(new Web3.providers.HttpProvider('https://datafeed.dexit.network'));

  const web3 = new Web3();
  // web3.setProvider("https://datafeed.dexit.network");
  // web3.setProvider("https://testnet.dexit.network");  

  web3.setProvider("https://datafeed.dexit.network");


  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchBlock, setSearchBlock] = React.useState(0);
  const[blockDetailsData,setBlockDetailsData]=React.useState()

  // Avoid a layout jump when reaching the last page with empty rows.

  const [dd, setdd] = useState([]);
  const[dummyData,setDummyData]=useState([])


  useEffect(() => {
    reInit()

    Init();
  }, []);

  // useEffect(() => {
  //     clearInterval(id);
  // }, [dd]);

  // const id = setInterval(() => {
  //   Init();
  // }, 4000);
  
  async function Init() {
    let ab = [];
    let bc = [];

    try {
      let currentBlock = await web3.eth.getBlockNumber();
      for (let j = currentBlock - 15; j < currentBlock; j++) {
        let getBlockDetails = await web3.eth.getBlock(j);
          setBlockDetailsData(getBlockDetails)
        if(getBlockDetails.transactions.length>0){
        for (let k = 0; k < getBlockDetails.transactions.length; k++) {
          let getTransactionDetails = await web3.eth.getTransactionReceipt(
            getBlockDetails.transactions[k]
          );
          bc.push(getTransactionDetails);
        }
      }
      }
      // console.log("updating the collection of transactions");
      setdd([...dd, ...bc]);
      // setDummyData([...dummyData, ...bc]);

    } catch (error) {
      console.log(error);
    }   
  }

  async function reInit() {
    try {
      let demo = [];
      let blocksDetails=[372530,372554,373094]
      for (let j =0; j < blocksDetails.length; j++) {
        let getBlockDetails = await web3.eth.getBlock(blocksDetails[j]);

        if (getBlockDetails.transactions.length > 0) {
          for (let k = 0; k < getBlockDetails.transactions.length; k++) {
            let getTransactionDetails = await web3.eth.getTransactionReceipt(
              getBlockDetails.transactions[k]
            );
            // console.log(getTransactionDetails)
            demo.push(getTransactionDetails);
          }
        }
      }
      setDummyData([...dummyData, ...demo]);
      // setdd([...dd, ...bc]);
      // console.log(demo,"demo")
    } catch (error) {
      console.log(error);
    }
  }


  const rows = dd;

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  async function searchTransactionByBlock() {
    try {
      let ab = [];
      let tr = await web3.eth.getBlock(searchBlock);
      console.log("trrr", tr.transactions);
      for (let i = 0; i < tr.transactions.length; i++) {
        let getTrans = await web3.eth.getTransaction(tr.transactions[i]);
        console.log("transaction", getTrans);
        ab.push(getTrans);
      }
      setdd(ab);
      console.log("dd", ab);
    } catch (error) {
      console.log(error);
    }
   
  }

  async function searchTransactionByTransactionHash() {
    try {
      let ab = [];
      console.log(searchBlock);
      let tr = await web3.eth.getTransaction(searchBlock);
      console.log("transaction details are", tr);
      ab.push(tr);
      setdd(ab);
    } 
    catch (error) {
      console.log(error);
    }
  }

  const shortenAccountId = (fullStr) => {
    const strLen = 30;
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
  const handleViewAllTxs = () =>{
    navigate("/transactions");
  }

  const handleHome=()=>{
    navigate('/')
  }

  const handleViewTransaction = (transaction) => {
    navigate("/hashinfo", { state: { details: transaction } });
  }

  return (
    <>
  <Grid container>
      <Grid xs={12} md={4}>
        <img height={100}  src={dexitLogo} style={{cursor:"pointer"}} onClick={()=>handleHome()}/>
      </Grid>
      
      <Grid xs={12} md={8}>
        <SearchBox />
      </Grid>
    </Grid>

    <Header3 />

      {/* {console.log("Transaction length", dd.length)} */}
      <div className="container-fluid">
        {/* <h1>Transaction Details</h1> */}

        {/* <Input
          type="number"
          placeholder="By Block"
          onChange={(e) => setSearchBlock(e.target.value)}
        />
        <Button
          variant="outlined"
          onClick={searchTransactionByBlock}
          sx={{ ml: 2 }}
        >
          Search
        </Button>
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <Input
          type="string"
          placeholder="By Hash"
          onChange={(e) => setSearchBlock(e.target.value)}
        />
       <Button
          variant="outlined"
          onClick={searchTransactionByTransactionHash}
          sx={{ ml: 2 }}
        >
          Search
        </Button> */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead >
            <TableRow>
                <Typography sx={{p:1.7}}>Latest Transactions</Typography>
              </TableRow>
              <TableRow style={{background:"whitesmoke"}}>
                <TableCell align="left">Transaction Hash</TableCell>
                <TableCell align="left">Block</TableCell>
                <TableCell align="left">From</TableCell>
                <TableCell align="center"></TableCell>
                <TableCell align="left">To</TableCell>
                <TableCell align="left">Block hash</TableCell>
              </TableRow>
            </TableHead>
            {dd.length > 0 ? (
              <TableBody>
                {(rowsPerPage > 0
                  ? rows.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                  : dd
                ).slice(0)
                .reverse()
                .map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } ,cursor:"pointer"}}
                    onClick={()=>handleViewTransaction(row.transactionHash)}
                  >
                    <TableCell align="left">
                    {shortenAccountId(row.transactionHash)}
                    </TableCell>
                    <TableCell align="left">{row.blockNumber}</TableCell>
                    {/* <TableCell align="left">{blockDetailsData ? moment.unix(blockDetailsData.timestamp).format("YYYY-MM-DD h:mm:ss a") :"-"}</TableCell> */}
                    <TableCell align="left" >{shortenAccountId(row.from)}</TableCell>
                    <TableCell align="center" style={{width:40}}><ArrowCircleRightRoundedIcon/></TableCell>
                    <TableCell align="left">{row.to==null ? shortenAccountId(row.contractAddress) : row.to}</TableCell>
                    <TableCell align="left">{shortenAccountId(row.blockHash)}</TableCell>
                    {/* {console.log(row.contractAddress,"contractAddress")} */}
                  </TableRow>
                ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
            ) : (
              <TableBody>
                {dummyData
                .slice(0)
                .reverse()
                .map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } ,cursor:"pointer"}}
                    onClick={()=>handleViewTransaction(row.transactionHash)}
                  >
                    <TableCell align="left">
                    {shortenAccountId(row.transactionHash)}
                    </TableCell>
                    <TableCell align="left">{row.blockNumber}</TableCell>
                    {/* <TableCell align="left">{blockDetailsData ? moment.unix(blockDetailsData.timestamp).format("YYYY-MM-DD h:mm:ss a") :"-"}</TableCell> */}
                    <TableCell align="left" >{shortenAccountId(row.from)}</TableCell>
                    <TableCell align="center" style={{width:40}}><ArrowCircleRightRoundedIcon/></TableCell>
                    <TableCell align="left">{row.to==null ? shortenAccountId(row.contractAddress) : row.to}</TableCell>
                    <TableCell align="left">{shortenAccountId(row.blockHash)}</TableCell>
                    {/* {console.log(row.contractAddress,"contractAddress")} */}
                  </TableRow>
                ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
              // <TableRow align="center">
              //   <TableCell colSpan={12} align="center">
              //       <Box sx={{ display: 'flex',justifyContent:"center" }}>
              //           <CircularProgress />
              //       </Box>
              //   </TableCell>
              // </TableRow>
            )}
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[ 15, { label: "All", value: -1 }]}
                  colSpan={3}
                  count={rows.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  SelectProps={{
                    inputProps: {
                      "aria-label": "rows per page",
                    },
                    native: true,
                  }}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
                </TableFooter>
          </Table>
        
        </TableContainer>
      </div>
    </>
  );
}
