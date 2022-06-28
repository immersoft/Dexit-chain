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
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import Web3 from "web3";
import { useState, useEffect } from "react";
import { styled } from '@mui/system';
import dexitLogo from "../../../Image/graphics-06.png";

import {
  Avatar,
  Button,
  CardMedia,
  CircularProgress,
  Grid,
  Input,
  Typography,
} from "@mui/material";
import moment from "moment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import Header3 from "../../Header/Header3";
import SearchBox from "../Home/SearchBox";

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


const columns = [
  {id:'id',label:'S.NO',minWidth:20},
  { id: 'address', label: 'Block', minWidth: 50 },
  { id: 'amount', label: 'Age', minWidth: 50 },
  { id: 'votingpower', label: 'Txn', minWidth: 50 },
  { id: 'firstBlock', label: 'Gas Used', minWidth: 50 },
  { id: 'lastBlock', label: 'Gas Limit', minWidth: 50 },
];

export default function Blocks() {
  const web3 = new Web3();
  // const web3 = new Web3(new Web3.providers.HttpProvider('https://datafeed.dexit.network'));

  // web3.setProvider("https://testnet.dexit.network");  
  // web3.setProvider("https://datafeed.dexit.network");  
  web3.setProvider("https://datafeed.dexit.network");

  // const provider = new ethers.providers.Web3Provider("https://datafeed.dexit.network")
  const navigate = useNavigate();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(15);
  const [searchBlock, setSearchBlock] = React.useState(0);
  const [dd, setdd] = useState([]);
  const [singleBlock, setSingleBlock] = useState();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    Init();
  }, []);

  // useEffect(() => {
  //   clearInterval(id);
  // }, []);

  // const id = setInterval(() => {
  //   Init();
  // }, 15000);


// useEffect(()=>{
//   console.log("called functions")
//   getAddressDara()
// },[])

//   const getAddressDara=async()=>{
//     let blockAddress=await Connections.getAddress();
//     // let transactionCountData=await Connections.getTransactionCount("0xb710C0779AFe841c6dF6e254877A11f1beEe302D");
//     console.log(blockAddress,"dataa")
//   }


  async function Init() {
    // console.log("called init blocks");
    let ab = [];
    let bc = [];

    try {
      let currentBlock = await web3.eth.getBlockNumber();
      for (let j = currentBlock - 16; j < currentBlock; j++) {
        let getBlockDetails = await web3.eth.getBlock(j);
        bc.push(getBlockDetails);
      }
      setdd([...dd, ...bc]);
    } catch (error) {
      console.log(error);
    }
  }

  const rows = dd;
  // console.log(rows, "rows");
  //   console.log(rows.length,"rows length")

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const handleChangePage = (event, newPage) => {
    // console.log("page called next")
    Init()
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const singleTransactionDetails = (row) => {
    // console.log(row, "number");
    navigate("/blockdetails", { state: { row: row } });
    setSingleBlock(row);
    setShowDetails(true);
  };

  const handleChangeState = () => {
    setShowDetails(false);
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

  const blockTransactions = (transactions, blockNumber, timestamp) => {
    navigate("/transactionDetails", {
      state: {
        transactions: transactions,
        blockNumber: blockNumber,
        timestamp: timestamp,
      },
    });
  };

  //   const getBlockDetails=(hash)=>{
  //         navigate('/transactionDetails',{state:{details:hash}})
  // }
  //   const getLists=(transactions)=>{
  //     setTransactionLists(transactions)
  //     console.log(transactions,"details",blockNumber,"time",timestamp)
  //     navigate('/transactionDetails',{state:{transactions:transactions,blockNumber:blockNumber,timestamp:timestamp}})
  //     console.log(transactions,"details 2")

  // }

  const handleHome=()=>{
    navigate('/')
  }

  return (
    <>
    <Grid container sx={{display:"flex",alignItems:"center"}}>
      <Grid xs={12} md={4}>
        <img  height={100}  src={dexitLogo} style={{cursor:"pointer"}} onClick={()=>handleHome()}/>
      </Grid>
      
      <Grid xs={12} md={8}>
        <SearchBox />
      </Grid>
    </Grid>
      
      <div style={{marginTop:"-1rem"}}>
      <Header3 />
      </div>

      <div className="container-fluid">
        <Card sx={{ p: 2, boxShadow: "none", background: "#F8F9FA" }}>
          <Typography variant="h5" component="h2">
            Blocks
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 1.4, boxShadow: "none" }}>
            <Table sx={{ minWidth: 600 }} aria-label="simple table">
              <TableHead>
                {/* <TableRow>
                <Typography sx={{p:1.7}}>Latest Blocks</Typography>
              </TableRow> */}
                <TableRow style={{ background: "whitesmoke" }}>
                  <TableCell align="center">S.No</TableCell>
                  <TableCell align="center">Block</TableCell>
                  <TableCell align="center">Age</TableCell>
                  <TableCell align="center">Txn</TableCell>
                  <TableCell align="center">Gas Used</TableCell>
                  <TableCell align="center">Gas Limit</TableCell>
                   {/* {columns.map((column) => (
                                <TableCell
                                key={column.id}
                                align={column.align}
                                style={{ minWidth: column.minWidth }}
                                >
                                {column.label}
                                </TableCell>
                            ))} */}
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
                  )
                    .slice(0)
                    .reverse()
                    .map((row, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          cursor: "pointer",
                        }}
                      >
                        <TableCell align="center" style={{width:10 }}>{index+1}</TableCell>
                        <TableCell
                          align="center"
                          sx={{ color: "#3498E2" }}
                          onClick={() => singleTransactionDetails(row.number)}
                          style={{width:20 }}
                        >
                          {row.number}
                        </TableCell>

                        <TableCell align="center" style={{width:50}}>
                          {moment
                            .unix(row.timestamp)
                            .format("YYYY-MM-DD h:mm:ss a")}
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{ color: "#3498E2" }}
                          style={{width:20 }}
                          onClick={() =>
                            blockTransactions(
                              row.transactions,
                              row.number,
                              row.timestamp
                            )
                          }
                        >
                          {row.transactions.length}
                        </TableCell>
                        {/* <TableCell align="center" sx={{color:"#3498E2"}} >{shortenAccountId(row.hash)}</TableCell> */}
                        <TableCell align="center" style={{width:20 }}>{row.gasUsed}</TableCell>
                        <TableCell align="center" style={{width:100 }}>{row.gasLimit}</TableCell>
                       
                        {/* {console.log(moment.unix(row.timestamp).startOf('seconds').fromNow(),"seconds")} */}
                        {/* {console.log(moment(row.timestamp).format("YYYY-MM-DD h:mm:ss a").fromNow())} */}
                        {/* {console.log(moment.unix(row.timestamp).format("YYYY-MM-DD h:mm:ss a"))} */}
                      </TableRow>
                    ))}
                  {/* {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )} */}
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
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[15, { label: "All", value: -1 }]}
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
        </Card>
      </div>
    </>
  );
}
