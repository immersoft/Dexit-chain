import React, { useState } from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Blockchains from "./SubNav/Blockchains";
import Validators from "./SubNav/Validators";
import { Button, CardMedia } from "@mui/material";
import dexitLogo from "../../Image/graphics-06.png";
import { ethers } from "ethers";
import { useLocation, useNavigate } from "react-router-dom";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import { GifBox } from "@mui/icons-material";
import './Navbar.css'
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import metaMaskLogo from "../../Image/metamask.svg";
import Web3 from "web3";
import Voting from "./SubNav/Voting";
import Connect from "./SubNav/Connect";
import Contract from './SubNav/Contract'

export default function Navbar() {

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
    const [errorMessage, setErrorMessage] = useState(null);
    const [defaultAccount, setDefaultAccount] = useState(null);
    const [userBalance, setUserBalance] = useState(null);
    const [connButtonText, setConnButtonText] = useState("Connect Wallet");
    
  
    const handleMobileMenuClose = () => {
      setMobileMoreAnchorEl(null);
    };
  

  
    const handleMobileMenuOpen = (event) => {
      setMobileMoreAnchorEl(event.currentTarget);
    };
  
    const connectWalletHandler = () => {
      if (window.ethereum && window.ethereum.isMetaMask) {
        console.log("MetaMask Here!");
  
        window.ethereum
          .request({ method: "eth_requestAccounts" })
          .then((result) => {
            accountChangedHandler(result[0]);
            setConnButtonText("Wallet Connected");
            getAccountBalance(result[0]);
          })
          .catch((error) => {
            setErrorMessage(error.message);
          });
      } else {
        console.log("Need to install MetaMask");
        setErrorMessage("Please install MetaMask browser extension to interact");
      }
    };
  
  
    // update account, will cause component re-render
    const accountChangedHandler = (newAccount) => {
      setDefaultAccount(newAccount);
      // console.log(newAccount,"newAccount")
      getAccountBalance(newAccount.toString());
    };
  
    const getAccountBalance = (account) => {
      window.ethereum
        .request({ method: "eth_getBalance", params: [account, "latest"] })
        .then((balance) => {
          setUserBalance(ethers.utils.formatEther(balance));
        })
        .catch((error) => {
          setErrorMessage(error.message);
        });
    };
  
    const chainChangedHandler = () => {
      // reload the page to avoid any errors with chain change mid use of application
      window.location.reload();
    };
  
  
  
    // listen for account changes
    try {
      window.ethereum.on("accountsChanged", accountChangedHandler);
  
      window.ethereum.on("chainChanged", chainChangedHandler);
        
    } catch (error) {
      
    }
  
    // const handleRoute = () => {
    //   navigate("/staking");
    // };
  
    const handleHome = () => {
      navigate("/");
    };
  
    const handleBlock = () => {
      navigate("/allblocks");
    };
  
    const handleVoting=()=>{
      navigate('/voting')
    }

    const mobileMenuId = "primary-search-account-menu-mobile";
  
    const renderMobileMenu = (
      <Menu
        anchorEl={mobileMoreAnchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        id={mobileMenuId}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        sx={{ width: "auto" }}
      >
        <MenuItem>
          <IconButton
            size="small"
            aria-label="show 4 new mails"
            color="inherit"
            onClick={() => handleHome()}
          >
            <span style={{ fontSize: "13px", textTransform: "uppercase" }}>
              Home
            </span>
          </IconButton>
        </MenuItem>
  
  
        <MenuItem>
          <IconButton
            size="small"
            aria-label="show 4 new mails"
            color="inherit"
            onClick={() => handleStack()}
          >
            <span style={{ fontSize: "13px", textTransform: "uppercase" }}>
              Stake
            </span>
          </IconButton>
        </MenuItem>
  
        <MenuItem>
          <IconButton
            size="small"
            aria-label="show 4 new mails"
            color="inherit"
            onClick={() => handleUnStack()}
          >
            <span style={{ fontSize: "13px", textTransform: "uppercase" }}>
              Un-Stake
            </span>
          </IconButton>
        </MenuItem>
  
        <MenuItem>
          <IconButton
            size="small"
            aria-label="show 4 new mails"
            color="inherit"
            onClick={() => handleBlock()}
          >
            <span style={{ fontSize: "13px", textTransform: "uppercase" }}>
              Blocks
            </span>
          </IconButton>
        </MenuItem>

        <MenuItem>
          <IconButton
            size="small"
            aria-label="show 4 new mails"
            color="inherit"
            onClick={() => handleFaucet()}
          >
            <span style={{ fontSize: "13px", textTransform: "uppercase" }}>
              Faucet
            </span>
          </IconButton>
        </MenuItem>

        {/* <MenuItem>
          <IconButton
            size="small"
            aria-label="show 4 new mails"
            color="inherit"
            onClick={() => handleSwap()}
          >
            <span style={{ fontSize: "13px", textTransform: "uppercase" }}>
              Swap
            </span>
          </IconButton>
        </MenuItem> */}

        <MenuItem>
          <IconButton
            size="small"
            aria-label="show 4 new mails"
            color="inherit"
            onClick={() => handleDeploy()}
          >
            <span style={{ fontSize: "13px", textTransform: "uppercase" }}>
              Deploy
            </span>
          </IconButton>
        </MenuItem>


        {/* <MenuItem>
          <IconButton
            size="small"
            aria-label="show 4 new mails"
            color="inherit"
            onClick={()=>handleVoting()}
          >
            <span style={{ fontSize: "13px", textTransform: "uppercase" }}>
            Voting
            </span>
          </IconButton>
        </MenuItem> */}
  
  
        {/* <MenuItem>
          <IconButton
            size="large"
            aria-label="show 17 new notifications"
            color="inherit"
            onClick={()=>handleVoting()}
          >
            <span style={{ fontSize: "13px", textTransform: "uppercase" }}>
                Voting
              </span>
            <Blockchains />
          </IconButton>
        </MenuItem> */}

        <MenuItem>
          <IconButton
            size="large"
            aria-label="show 17 new notifications"
            color="inherit"
            // onClick={() => handleRoute()}
          >
            <Voting/>

          </IconButton>
        </MenuItem>
        <MenuItem>
          <IconButton
            size="large"
            aria-label="show 17 new notifications"
            color="inherit"
            // onClick={() => handleRoute()}
          >
           <Contract />

          </IconButton>
        </MenuItem>
        <MenuItem>
          <IconButton
            size="large"
            aria-label="show 17 new notifications"
            color="inherit"
            // onClick={() => handleRoute()}
          >
            <Validators />
          </IconButton>
        </MenuItem>

        <MenuItem>
          <IconButton
            size="large"
            aria-label="show 17 new notifications"
            color="inherit"
          >
            <Connect/>

          </IconButton>
        </MenuItem>
  
        {/* <MenuItem>
          <IconButton
            size="large"
            aria-label="show more"
            aria-haspopup="true"
            onClick={connectWalletHandler}
            color="inherit"
          >
            <CardMedia component="img" height="50" image={metaMaskLogo} />
          </IconButton>
        </MenuItem> */}
      </Menu>
    );
  
  
    if (
      location.pathname === "/allblocks" ||
      location.pathname === "/alltransactions"
    )
      return null;
  
    const handleStack = () => {
      navigate("/staking");
    };
  
    const handleUnStack = () =>{
      navigate("/unstaking")
    }

    const navigatRoute=()=>{
      navigate('/')
    }

    const handleDeposite=()=>{
      navigate('/deposit')
    }

    const handleFaucet=()=>{
      navigate('/faucet')
    }

    const handleSwap=()=>{
      navigate('/swap')
    }


    const handleDeploy=()=>{
      navigate('/deploy')
    }

  return (
    <>
     <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{ background: "white", color: "#7A93B4", boxShadow: "none" }}
      >
        <Toolbar>
          <Box
            size="large"
            edge="start"
            color="inherit"
            // aria-label="open drawer"
            sx={{ mr: 2,cursor:'pointer' }}
            onClick={navigatRoute}
            
          >
            {/* <CardMedia component="img" height="100" image={dexitLogo} /> */}
            <img  height={100}  src={dexitLogo} alt="dexitlogo" />

          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box
            sx={{ display: { xs: "none", md: "flex", alignItems: "center" } }}
          >
            <Button
              id="demo-customized-button"
              onClick={() => handleHome()}
              disableElevation
              sx={{ border: "none", color: "#7A93B4" }}
            >
              <span style={{ fontSize: "14px", textTransform: "none" }}>
                Home
              </span>
            </Button>

            <Button
              id="demo-customized-button"
              disableElevation
              sx={{ border: "none", color: "#7A93B4" }}
              onClick={handleStack}
            >
              <span style={{ fontSize: "14px" ,textTransform: "none"}}>
                Stake
              </span>
            </Button>

            <Button
            id="demo-customized-button"
            disableElevation
            sx={{ border: "none", color: "#7A93B4" }}
            onClick={handleUnStack}
          >
            <span style={{ fontSize: "14px", textTransform: "none" }}>
              Un-Stake
            </span>
          </Button>

            <Button
              id="demo-customized-button"
              onClick={() => handleBlock()}
              disableElevation
              sx={{ border: "none", color: "#7A93B4" }}
            >
              <span
                style={{
                  fontSize: "14px",
                  // marginLeft: "12px",
                  textTransform: "none"
                }}
              >
                Blocks
              </span>
            </Button>

            <Button
              id="demo-customized-button"
              onClick={() => handleFaucet()}
              disableElevation
              sx={{ border: "none", color: "#7A93B4" }}
            >
              <span
                style={{
                  fontSize: "14px",
                  // marginLeft: "12px",
                  textTransform: "none"
                }}
              >
                Faucet
              </span>
            </Button>

            {/* <Button
              id="demo-customized-button"
              onClick={() => handleSwap()}
              disableElevation
              sx={{ border: "none", color: "#7A93B4" }}
            >
              <span
                style={{
                  fontSize: "14px",
                  // marginLeft: "12px",
                  textTransform: "none"
                }}
              >
                Swap
              </span>
            </Button> */}

            <Button
              id="demo-customized-button"
              onClick={() => handleDeploy()}
              disableElevation
              sx={{ border: "none", color: "#7A93B4" }}
            >
              <span
                style={{
                  fontSize: "14px",
                  // marginLeft: "12px",
                  textTransform: "none"
                }}
              >
                Deploy
              </span>
            </Button>

           


            <Box sx={{ml:1}}>
                <Voting/>
            </Box>
            <Box sx={{ml:1}}>
                <Contract/>
            </Box>


            {/* <Box
              size="large"
              aria-label="show 17 new notifications"
              color="inherit"
              sx={{border: "none", color: "#7A93B4"}}
              onClick={()=>handleVoting()}
            >
               <span style={{ fontSize: "14px",  textTransform: "none" }}>
                Voting
              </span>
              <Blockchains />
            </Box> */}
            <Box sx={{ml:1}}>
              <Validators />
            </Box>

            <Box sx={{ml:1}}>
              <Connect/>
            </Box>
            {/*<Button
              id="demo-customized-button"
              color="error"
              variant="contained"
              onClick={connectWalletHandler}
            >
              Connect
            </Button>*/}
            {/* <IconButton
              size="large"
              aria-label="show more"
              aria-haspopup="true"
              onClick={connectWalletHandler}
              color="inherit"
            >
              <Button variant="outlined" size="small" startIcon={<InsertLinkIcon />}>Connet Wallet</Button>
            </IconButton> */}
          </Box>
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
    </Box>
    </>
  )
}
