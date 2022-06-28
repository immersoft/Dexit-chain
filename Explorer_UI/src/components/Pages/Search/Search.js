import {
  Box,
  Divider,
  Grid,
  IconButton,
  InputBase,
  InputLabel,
  MenuItem,
  Paper,
  Typography,
  CircularProgress
} from "@mui/material";
import React, { useState } from "react";
import "./Search.css";
import { SearchOutlined } from "@mui/icons-material";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";

const Search = () => {
  const [searchInput, setSearchInput] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const web3 = new Web3();
  // web3.setProvider("https://datafeed.dexit.network");
  // web3.setProvider("https://testnet.dexit.network");  

  web3.setProvider("https://datafeed.dexit.network");

  const navigate = useNavigate();

  const getBlockDetails = async () => {
    setShowLoader(true);
    try {
      if (searchInput.length <= 10) {
        let blockDetails = await web3.eth.getBlock(searchInput);
        console.log(blockDetails, "blockDetails");
        navigate(`/block/${searchInput}`, { state: { blockDetails: blockDetails } });
      }
      else if(searchInput.length==42){
        let balance=await web3.eth.getBalance(searchInput)
        // console.log(balance,"balance")
        navigate(`/address/${searchInput}`, { state: { balance: balance ,account:searchInput} });
        
      } 
      else if (searchInput.length > 42) {
        navigate("/hashinfo", { state: { details: searchInput } });
      }
    } catch (error) {
      setShowLoader(true);

      console.log(error);
    }
    setShowLoader(true);
  };

  return (
    <>
      <div className="parent_div">
        <Grid container>
          <Grid xs={12} item sm={8} md={9} style={{ padding: "4% 3.5%" }}>
            <Typography sx={{ color: "#D6DA3C", fontSize: "1.5rem", pb: 1 }}>
              DeXit Explorer
            </Typography>
            <Paper
              component="form"
              sx={{ p: "0px 2px", display: "flex", alignItems: "center" }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search by Address/Block number/Txn Hash"
                fullWidth
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />

              <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
              {showLoader === false ? (
                <IconButton
                  color="primary"
                  sx={{ p: "10px" }}
                  aria-label="directions"
                  onClick={() => getBlockDetails()}
                >
                  <SearchIcon />
                </IconButton>
              ) : (
                <Box sx={{ display: "flex" }}>
                  <CircularProgress size={30} sx={{margin:'6px'}}/>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default Search;
