import React, { useState, useEffect, Suspense } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { Card, Typography, Button, CircularProgress } from "@mui/material";
import { Box } from "@mui/system";
import Connection from "../../../Contract";
import { useNavigate } from "react-router-dom";

const columns = [
  { id: "rank", label: "Rank", minWidth: 20 },
  { id: "address", label: "Address", minWidth: 50 },
  { id: "amount", label: "Amount", minWidth: 50 },
  { id: "votingpower", label: "Voting Power/%", minWidth: 50 },
  { id: "numberofdelegator", label: "No. of Delegators", minWidth: 50 },
  { id: "delegator", label: "Delegate", minWidth: 50 },
  // { id: "firstBlock", label: "First Block", minWidth: 50 },
  // { id: "lastBlock", label: "Last Block", minWidth: 50 },
];

const ValidatorSetInfo = () => {
  const [dd, setDD] = useState([]);
  // console.log("TXTABLE",dd);
  const navigate = useNavigate();
  const [listData, setListData] = useState(true);
  let customList = [];
  let [account, setAccount] = useState("");
  const [noList,setnoList]=useState(false);


  const getAccounts = async () => {
    try {
      account = await window.ethereum.selectedAddress;
      setAccount(account);
    } catch (error) {
      console.log(error);
    }
  };
  try {
    window.ethereum.on("accountsChanged", function () {
      getAccounts();
    });
  } catch (error) {
    console.log(error);
  }

  useEffect(() => {
    getBalanceData();
    getAccounts();

    return () => {};
  }, []);

  async function getBalanceData() {
    try {
      console.log("function called");
      let list = await Connection.getHighestValidators();
      handleValidatorListDetails(list);
    } catch (error) {
      console.log(error);
      setnoList(true)

    }
  }

  const handleValidatorListDetails = async (list) => {
    try {
      let contract = await Connection.totalDXTStake();
      if (list) {
        for (let i = 0; i < list.length; i++) {
          let dataget = await Connection.getValidatorInfo(list[i]);
          // console.log(dataget, "dataget");
          let totalVotingPower =
            (dataget[3].toString() / contract.toString()) * 100;
          let customObject = {
            address: list[i],
            amount: dataget[3].toString(),
            votingpower: totalVotingPower,
            numberOfDelegators: dataget[6].length,
          };
          let check = customList.find((item) => item.address === list[i][0]);
          if (check == undefined) {
            customList.push(customObject);
          }
        }
      }
      console.log("cncncncn", customList);
      setDD(customList);
      setListData(!listData); // console.log(dd,"listttedd")
    } catch (error) {
      console.log(error);
    }
  };

  const validatorDetailsData = (details) => {
    navigate("/validator_details", { state: { details: details } });
  };

  const numberOfDelegators = (validatorAddress) => {
    // console.log(validatorAddress, "validatorAddress");
    if (validatorAddress) {
      navigate("/delegator_count", {
        state: { validatorAddress: validatorAddress },
      });
    }
  };

  return (
    <>
      <div className="validator_container">
        <Card
          sx={{
            display: "flex",
            p: 2,
            flexDirection: "column",
            boxShadow: "none",
            background: "#F8FAFD",
          }}
        >
          <Typography variant="h6">Active Validators</Typography>
          <Box sx={{ flexGrow: 1, mt: 2 }}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650, p: 2 }} aria-label="simple table">
                {
                  dd.length>0 ?
                <>
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
                {/* <TableBody> */}
                  { 
                    dd.slice(0).sort(function(a,b){
                      return b.amount -a .amount;
                    }).map((item,index) => {
                      return (
                        <>
                        <TableBody>
                            <TableRow
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                              // onClick={()=>validatorDetailsData(item)}
                            >

                              <TableCell component="th" scope="row">
                                {index+1}
                              </TableCell>

                              <TableCell component="th" scope="row">
                                {item.address}
                              </TableCell>

                              <TableCell>
                                {item.amount.slice(0, -18)}
                              </TableCell>

                              <TableCell>
                                {item.amount.slice(0, -18)}/
                                {item.votingpower.toFixed(2)}%
                              </TableCell>

                              <TableCell>
                                <Button
                                  id="btn"
                                  variant="outlined"
                                  size="small"
                                  onClick={() =>
                                    numberOfDelegators(item.address)
                                  }
                                >
                                  {item.numberOfDelegators}
                                </Button>
                              </TableCell>

                              <TableCell>
                                {item.address.toLowerCase() != account ? (
                                  <Button
                                    variant="outlined"
                                    onClick={() => validatorDetailsData(item)}
                                  >
                                    Delegate
                                  </Button>
                                ) : (
                                  <Button variant="contained" disabled>
                                    Delegate
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                        </TableBody>
                        </>
                      );
                    })
                   }
                </>
                :
                <>
                    {dd.length===0 ? noList==true?
                    <div style={{textAlign:"center",margin:"15%"}}>
                      <Typography variant="h5">No Transaction Found</Typography>
                    </div>
                    :
                    <>  
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                      <CircularProgress />
                    </Box>
                    </>
                   : "Error Occured"}
                      
                    </>
              }
              </Table>
            </TableContainer>
          </Box>
        </Card>
      </div>
    </>
  );
};

export default ValidatorSetInfo;
