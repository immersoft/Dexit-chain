import React, { useState } from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Blockchains from "../Navbar/SubNav/Blockchains";
import Validators from "../Navbar/SubNav/Validators";
import { Button, CardMedia } from "@mui/material";
import logo from "../../Image/logo512.png";
import dexitLogo from "../../Image/graphics-06.png";
import { ethers } from "ethers";
import { useLocation, useNavigate } from "react-router-dom";
import MoreIcon from "@mui/icons-material/MoreVert";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import { GifBox } from "@mui/icons-material";
import metaMaskLogo from "../../Image/metamask.svg";
import Voting from "../Navbar/SubNav/Voting";
import Connect from "../Navbar/SubNav/Connect";

const Header3 = () => {
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
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
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

  try {
    window.ethereum.on("accountsChanged", accountChangedHandler);

  window.ethereum.on("chainChanged", chainChangedHandler);
  } catch (error) {
    console.log(error)
  }
  // listen for account changes
  

  const handleRoute = () => {
    navigate("/staking");
  };

 
  const handleHome = () => {
    navigate("/");
  };

  const handleBlock = () => {
    navigate("/allblocks");
  };

  const handleVoting=()=>{
    navigate('/voting')
  }

  const handleFaucet=()=>{
    navigate('/faucet')
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

      <MenuItem>
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
        </MenuItem>

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

  const handleStack = () =>{
    navigate("/staking")
  }

  const handleUnStack = () =>{
    navigate("/unstaking")
  }

  const handleSwap=()=>{
    navigate('/swap')
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{ background: "white", color: "#7A93B4", boxShadow: "none" }}
      >
        <Toolbar>
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
            <span style={{ fontSize: "14px", textTransform: "none" }}>
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
                  textTransform: "none",
                  // marginLeft: "12px",
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

            <Button
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
            </Button>

            <Box sx={{ml:1}}>
                <Voting/>
            </Box>

            {/* <Button
              id="demo-customized-button"
              onClick={()=>handleVoting()}
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
                Voting
              </span>
            </Button> */}

            {/* <Box
              size="large"
              aria-label="show 17 new notifications"
              color="inherit"
              onClick={()=>handleVoting()}
            >
             
              <span style={{ fontSize: "13px", textTransform: "uppercase" }}>
                Voting
              </span>
              <Blockchains />
            </Box> */}
            <Box>
              <Validators />
            </Box>

            <Box sx={{ml:1}}>
              <Connect/>
            </Box>

            {/* <IconButton
              size="large"
              aria-label="show more"
              aria-haspopup="true"
              onClick={connectWalletHandler}
              color="inherit"
            >
              <CardMedia component="img" height="50" image={metaMaskLogo} />
            </IconButton> */}
          </Box>
          <Box></Box>
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
  );
};

export default Header3;
