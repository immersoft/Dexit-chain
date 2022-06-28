import { SearchOutlined } from '@mui/icons-material'
import { Box, Button, Divider, Grid, IconButton, InputBase, Paper, TextField } from '@mui/material'
import React,{useState} from 'react'
import './SearchBox.css'
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import DirectionsIcon from '@mui/icons-material/Directions';
import SearchIcon from '@mui/icons-material/Search';



const SearchBox = () => {
  const [searchInput, setSearchInput] = useState("");
  const web3 = new Web3();
  // web3.setProvider("https://datafeed.dexit.network");
  // web3.setProvider("https://testnet.dexit.network");  

  web3.setProvider("https://datafeed.dexit.network");

  const navigate = useNavigate();

  const getBlockDetails = async () => {
    try {
      if (searchInput.length <= 10) {
        let blockDetails = await web3.eth.getBlock(searchInput);
        navigate(`/block/${searchInput}`, { state: { blockDetails: blockDetails } });
      } 
      else if(searchInput.length==42){
        let balance=await web3.eth.getBalance(searchInput)
        navigate(`/address/${searchInput}`, { state: { balance: balance ,account:searchInput} });
        
      } 
      else if (searchInput.length > 42) {
        navigate("/hashinfo", { state: { details: searchInput } });
      }
    } catch (error) {
      console.log(error)
    }
  };
  return (
    <>
    {/* <div className='search_box_container'>
      <Grid container>
        <Grid xs={8} md={10}>
        <TextField
        fullWidth
          id="outlined-search"
          type="search"
          placeholder="Search by Block number/Txn Hash"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        </Grid>
        <Grid xs={4} md={2}>
        <Button
          variant="contained"
          id="btn_search"
          startIcon={<SearchOutlined fontSize="large" />}
          onClick={() => getBlockDetails()}
        ></Button>
        </Grid>
      </Grid>
    </div> */}
<Grid container>
  <Grid xs={12} md={12} sx={{padding:"1% 4%"}}>
    <Paper
      component="form"
      sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search by Address/Block number/Txn Hash"
        // inputProps={{ 'aria-label': 'search google maps' }}
        fullWidth
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
      {/* <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
        <SearchIcon />
      </IconButton> */}
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions">
        <SearchIcon  onClick={() => getBlockDetails()}/>
      </IconButton>
    </Paper>
    </Grid>
</Grid>
    </>
  )
}

export default SearchBox