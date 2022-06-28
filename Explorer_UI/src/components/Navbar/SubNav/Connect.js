import React,{useEffect, useState} from "react";
import { styled, alpha } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useLocation, useNavigate } from "react-router-dom";
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import { ethers } from "ethers";
import Web3 from "web3";
import Web3Eth from 'web3-eth'
import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ToastContainer, toast } from "react-toastify";



const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === "light"
        ? "rgb(55, 65, 81)"
        : theme.palette.grey[300],
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      "&:active": {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}));

export default function Connect() {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [connButtonText, setConnButtonText] = useState("Connect Wallet");
  const[walletAddress,setWalletAddress]=useState(null)

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCreateProposal = () => {
    navigate("/create-proposal");
    handleClose()
  };

  const handleMyProposal = () =>{
    navigate("/my-proposal")
    handleClose()
  }

  const handleVoting=()=>{
    navigate("/voting")
    handleClose()
  }


  function handleAccountsChanged(accounts) {
    let currentAccount;
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log("Please connect to MetaMask.");
    } else if (accounts[0] !== currentAccount) {
      currentAccount = accounts[0];
    //   setuserAddresss(currentAccount);

      // Do any other work!
    }
  }
  const connectWalletHandler = () => {
      // console.log("called")
    // if (window.ethereum && window.ethereum.isMetaMask) {
    //   console.log("MetaMask Here!");

    //   window.ethereum
    //     .request({ method: "eth_requestAccounts" })
    //     .then((result) => {
    //       accountChangedHandler(result[0]);
    //       setConnButtonText("Wallet Connected");
    //       getAccountBalance(result[0]);
    //     })
    //     .catch((error) => {
    //       setErrorMessage(error.message);
    //     });
    // } else {
    //   console.log("Need to install MetaMask");
    //   setErrorMessage("Please install MetaMask browser extension to interact");
    // }
    
    try{
    if (window.ethereum) {
      console.log("called22")
        window.ethereum
          .request({ method: "eth_requestAccounts" })
          .then(handleAccountsChanged)
          .catch((err) => {
            if (err.code === 4001) {
              // EIP-1193 userRejectedRequest error
              // If this happens, the user rejected the connection request.
              console.log("Please connect to MetaMask.");
            } else {
              console.error(err);
            }
          });
      }
      else{
        toast.error("Please install MetaMask browser extension");
      }
    }
    catch(err){
      console.log(err)
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


  async function addNetwork(type, testMain) {
    let eth;
    let isTestnet = testMain;
    let netID;
    let web3 = new Web3();
    if (type === "web3") {
      if (typeof window.ethereum !== "undefined") {
        eth = new Web3Eth(window.ethereum);
      } else if (typeof web3 !== "undefined") {
        eth = new Web3Eth(web3.givenProvider);
      } else {
        eth = new Web3Eth(window.ethereum);
      }
    }

    if (typeof eth !== "undefined") {
      var network = 0;
      network = await eth.net.getId();
      console.log("network", network);
      netID = network.toString();
      var params;
      if (isTestnet === "false") {
        if (netID === "899") {
          alert("Dexit Network has already been added to Metamask.");
          return;
        } else {
          params = [
            {
              chainId: '0x383',
              chainName: "Dexit Live",
              nativeCurrency: {
                name: "DeXit",
                symbol: "DXT",
                decimals: 18,
              },
              // rpcUrls: ["https://testnet.dexit.network"],
              rpcUrls: ["https://datafeed.dexit.network"],
            //   blockExplorerUrls: ["https://testnet.dexit.network"],
            },
          ];
        }
      } 
      else {
        // if (netID === "80001") {
        //   alert("Polygon Mumbai Network has already been added to Metamask.");
        //   return;
        // } else {
        //   params = [
        //     {
        //       chainId: "0x13881",
        //       chainName: "Polygon Testnet",
        //       nativeCurrency: {
        //         name: "MATIC",
        //         symbol: "MATIC",
        //         decimals: 18,
        //       },
        //       rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
        //       blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
        //     },
        //   ];

        // }
        console.log("exist")

      }

      window.ethereum
        .request({ method: "wallet_addEthereumChain", params })
        .then(() => {console.log("Success")
        setTimeout(() => {
          window.location.reload()
          
        }, 3000);
}        
        )
        .catch((error) => console.log("Error", error.message));
    } else {
      alert("Unable to locate a compatible web3 browser!");
    }
  }

  React.useEffect(() => {
    if (window.ethereum) {
      getAbc()
    
      // detect Network account change
      // window.ethereum.on("chainChanged", function (networkId) {
      //   // getNetworkDetails();
      // });
      // window.ethereum.on("accountsChanged", function (accounts) {
      //   if (accounts[0]) {
      //     console.log(accounts[0]) 
      //     setWalletAddress(accounts[0])         
      //   }
      // });
    }
    getAccounts()
  }, []);

  async function getAbc(){
    let web3= new Web3(window.ethereum);
    let ch=await web3.eth.getAccounts();
    console.log("web3",ch )
    setWalletAddress(ch[0])         
  }

// useEffect(()=>{
//   connectWalletHandler()
// },[])

  const getAccounts = async () => {
    if(typeof window.ethereum !== "undefined"){
      try {
        let account = await window.ethereum.selectedAddress;
        setWalletAddress(account);
    } catch (error) {
        console.log(error);
    }
    }

};


const mobileMetamask=async ()=>{
    if(isMobile) {
      console.log("mobile");
    
    const provider = new WalletConnectProvider({
      infuraId: "27e484dcd9e3efcfd25a83a78777cdf1",
    });
    
    //  Enable session (triggers QR Code modal)
    await provider.enable();
    }
}

  return (
    <div>
      <ToastContainer />

      {/* <BrowserView> */}
      {walletAddress !=null ? 
      <Button
       id="demo-customized-button"
       aria-controls={open ? "demo-customized-menu" : undefined}
       aria-haspopup="true"
       aria-expanded={open ? "true" : undefined}
       variant="contained"
       color="success"
       disableElevation
       onClick={handleClick}
       startIcon={<InsertLinkIcon sx={{transform:"rotate(135deg)"}} />}
       
     >
     <span style={{textTransform:"none"}}>Connected</span>
      </Button>
      :
      <Button
        id="demo-customized-button"
        aria-controls={open ? "demo-customized-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="outlined"
        disableElevation
        onClick={handleClick}
        startIcon={<InsertLinkIcon sx={{transform:"rotate(135deg)"}} />}
        
      >
      <span style={{textTransform:"none"}}>Connect Wallet</span>
      </Button>
      }
      {/* </BrowserView> */}
      
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={connectWalletHandler} disableRipple>
         {walletAddress!=null ? <>Metamask Connected</> : <>Connect Metamask</>} 
        </MenuItem>

        <MenuItem onClick={()=>addNetwork("web3","false")} disableRipple>
          Add Network
        </MenuItem>
       
      </StyledMenu>

      {/* <MobileView>
      {walletAddress !=null ? 
      <Button
       id="demo-customized-button"
       aria-controls={open ? "demo-customized-menu" : undefined}
       aria-haspopup="true"
       aria-expanded={open ? "true" : undefined}
       variant="contained"
       color="success"
       disableElevation
       onClick={mobileMetamask}
       startIcon={<InsertLinkIcon sx={{transform:"rotate(135deg)"}} />}
       
     >
     <span style={{textTransform:"none"}}>Connected</span>
      </Button>
      :
      <Button
        id="demo-customized-button"
        aria-controls={open ? "demo-customized-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="outlined"
        disableElevation
        onClick={mobileMetamask}
        startIcon={<InsertLinkIcon sx={{transform:"rotate(135deg)"}} />}
        
      >
      <span style={{textTransform:"none"}}>Connect Wallet</span>
      </Button>
      }
      </MobileView> */}
    </div>
  );
}
