import { Box, Typography, Grid, Card } from "@mui/material";
import React, { useEffect, useState } from "react";
import Divider from "@mui/material/Divider";
import Web3 from "web3";
import Contract from "../../Contract";
import Graph from "../Graph/Graph";
import "./Detailsbox.css";
import Connection from '../../Contract';

// import axios from 'axios';

const DetailsBox = () => {
  const [currentBlockNumber, setCurrentBlock] = React.useState();
  const [votingPower, setVotingPower] = useState();
  const [toggleState, setToggleState] = useState(true);
  const [getApiDat, setApiData] = useState();
  const [toggleApiHandle, setToggleApiHandle] = useState(true);
  const [apiTotal, setApiTotal] = useState();
  const [hightCount,setHighestCount]=useState()
  const[highestValidatorCounts,setHighestValidatorCounts]=useState(0)
  const[getVotingPower,setTotalVotingPower]=useState(0)

  const web3 = new Web3();
  // web3.setProvider("https://datafeed.dexit.network");
  // web3.setProvider("https://testnet.dexit.network");  
  // web3.setProvider(window.ethereum);  

  web3.setProvider("https://datafeed.dexit.network");


  const getLatestBlockNumber = async () => {
    try {
      let contract = await Contract.totalDXTStake();
      setVotingPower(contract.toString());
      let currentBlock = await web3.eth.getBlockNumber();
      setToggleState(!toggleState);
    } catch (error) {
      console.log(error);
    }
  };

  const getTransactionCounts = async () => {
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch("https://final-dxt.herokuapp.com/blockstransactions", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        // console.log(JSON.parse(result))
        setApiData(JSON.parse(result));

        blockTransactionCount(JSON.parse(result));

        setToggleApiHandle(!toggleApiHandle);
      })
      .catch((error) => console.log("error", error));
  };

  const postTransactionCounts = (blocknum, totalCount) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      count: totalCount,
      start: blocknum,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("https://final-dxt.herokuapp.com/transactioncountupdate/1", requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));
  };

  useEffect(() => {
    getTransactionCounts();
    getCurrentBlockFunction();
    getLatestBlockNumber();
  }, []);

  const getCurrentBlockFunction = async () => {
    try {
      let blocknumber = await web3.eth.getBlockNumber();
      setCurrentBlock(blocknumber);
    } catch (error) {
      console.log(error);
    }
  };

  async function getBalanceData() {
    try {
      let list = await Connection.getHighestValidators();
      setHighestCount(list.length)
    } catch (error) {
      console.log(error);
    }
  }


  useEffect(() => {
    clearInterval(id);
  }, []);

  const id = setInterval(() => {
    getTransactionCounts();
  }, 60000 * 5);

  const blockTransactionCount = async (result) => {
    try {
      let counter = result.data[0].count;
      setApiTotal(counter);
      let currentBlock = await web3.eth.getBlockNumber();
      let counterTsx = await web3.eth.getBlockTransactionCount(currentBlock);
        let total = counterTsx + counter;
        setApiTotal(counter + counterTsx);
        postTransactionCounts(currentBlock, total);
    } catch (error) {
      console.log(error);
    }
  };

  const [currentPrice, setCurrentPrice] = useState();
  const [dilutedmarketCap, setDilutedMarketCap] = useState();
  const [priceChangePercentage30Days, setPriceChangePercentage30Days] =useState();

  async function fetchDXTDetails() {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/dexit-finance"
    );
    if (response.status === 200) {
      const res = await response.json();
      setCurrentPrice(res.market_data.current_price.usd);
      setDilutedMarketCap(res.market_data.fully_diluted_valuation.usd);
      setPriceChangePercentage30Days(
        res.market_data.price_change_percentage_30d
      );
    }
}


const validatorsCount=()=>{
  var requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };
  
  fetch("https://final-dxt.herokuapp.com/getHighestValidators", requestOptions)
    .then(response => response.text())
    .then(result =>{ 
      // console.log(JSON.parse(result),"api result get")
      setHighestValidatorCounts(JSON.parse(result))
    })
    .catch(error => console.log('error', error));
}


const totalVotingPower=()=>{
  var requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };
  
  fetch("https://final-dxt.herokuapp.com/getvotingpower", requestOptions)
    .then(response => response.text())
    .then(result => {
      // console.log(result,"result")
      setTotalVotingPower(JSON.parse(result))
    })
    .catch(error => console.log('error', error));
}

  useEffect(() => {
    totalVotingPower()
    validatorsCount()
    getBalanceData()
    fetchDXTDetails();
  }, []);

  return (
    <>
      {/* {console.log(getVotingPower.data,"voting power info")} */}
      {getApiDat ? (
        <Grid container>
          <Grid
            sm={12}
            item
            className="details_grid"
            sx={{ overflow: "hidden" }}
          >
            <Card
              sx={{
                backgroundColor: "white",
                color: "#12161C",
                border: "1px solid white",
                borderRadius: 5,
                minWidth: "90%",
              }}
              className="details-box"
            >
              <Box sx={{ flexGrow: 1 }}>
                <Grid container>
                  <Grid xs={12} item sm={12} md={4} sx={{ p: 4 }}>
                    <Typography sx={{ color: "gray" }}>
                      DeXit Network Price (DXT)
                    </Typography>
                    <Typography sx={{ mb: 2 }}>
                      ${currentPrice ? currentPrice : "loading"}
                    </Typography>

                    <Typography sx={{ color: "gray" }}>
                      PRICE CHANGE PERCENTAGE 30 DAYS
                    </Typography>
                    <Typography sx={{ mb: 2 }}>
                      {priceChangePercentage30Days
                        ? priceChangePercentage30Days
                        : "loading"}
                      %
                    </Typography>
                    <Divider />
                    <Typography sx={{ color: "gray", mt: 2 }}>
                      Fully Diluted Market Cap
                    </Typography>

                    <Typography sx={{ mb: 2 }}>
                      {" "}
                      ${dilutedmarketCap ? dilutedmarketCap : "loading"}
                    </Typography>
                  </Grid>

                  <Grid xs={12} item sm={12} md={4} sx={{ p: 4 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography sx={{ color: "gray" }}>
                          LATEST BLOCK
                        </Typography>
                        <Typography>
                          {currentBlockNumber ? currentBlockNumber : "-"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ color: "gray", ml: 4 }}>
                          TRANSACTIONS
                        </Typography>
                        <Typography sx={{ textAlign: "end" }}>
                          {getApiDat ? apiTotal : "0"}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider />
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        mt: 2,
                      }}
                    >
                      <Box>
                        <Typography sx={{ color: "gray" }}>
                          ACTIVE VALIDATOR
                        </Typography>
                        {/* <Typography>{hightCount ? hightCount: "0"}</Typography> */}
                        <Typography>{highestValidatorCounts!=0 ? highestValidatorCounts.data: "0"}</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ color: "gray", ml: 4 }}>
                          VOTING POWER
                        </Typography>
                        <Typography sx={{ textAlign: "end" }}>
                          {/* {votingPower
                            ? votingPower.slice(0, -18)
                            : "0"} */}

                          {getVotingPower!=0
                            ? getVotingPower.data.slice(0, -18)
                            : "0"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid xs={12} item sm={12} md={4} sx={{ p: 4 }}>
                    <Graph />
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </Grid>
        </Grid>
      ) : (
        "loading"
      )}
    </>
  );
};

export default DetailsBox;
