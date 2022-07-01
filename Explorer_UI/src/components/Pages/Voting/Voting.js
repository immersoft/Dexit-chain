import {
  Button,
  TextField,
  Card,
  Box,
  Divider,
  Typography,
  Grid,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Modal,
  Fade,
  CircularProgress,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import LoadingButton from "@mui/lab/LoadingButton";
import { useTheme } from "@mui/material/styles";
import OutlinedInput from "@mui/material/OutlinedInput";
import React, { useState, useEffect } from "react";
import Proposal from "../../../Proposal";
import bigInt from "big-integer";
import { styled } from "@mui/material/styles";
import Vote from "./Vote";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { ToastContainer, toast } from "react-toastify";
import Backdrop from '@mui/material/Backdrop';
import './Voting.css'
import VotingContract from '../../../AllContract/Voting'


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};


const columns = [
  { id: "sno", label: "S No.", minWidth: 50 },
  { id: "name", label: "Name", minWidth: 50 },
  { id: "value", label: "Value", minWidth: 50 },
  { id: "address", label: "Address", minWidth: 50 },
  { id: "info", label: "More Info", minWidth: 50 }
];


const Voting = () => {
  const [stakerAmount, setStakerAmount] = useState("");
  const [validatorlist, setValidatorlist] = useState([]);
  let [account, setAccount] = useState("");
  let [updateValue, setupdateValue] = useState(0);
  let [proposalList, setproposalList] = useState([]);
  let [proposalDetails, setproposalDetails] = useState([]);
  let [proposalData, setProposalData] = useState();
  let [miniValue, setMiniValue] = useState();
  let detailsList=[]
  const[proposalListData,setProposalListData]=useState()
  const [openAlert, setOpenAlert] = React.useState(false);
  const [senIdToVoteComp, setsenIdToVoteComp] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const [currentValueOfselectedVar, setcurrentValueOfselectedVar] = useState("");
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    minimumStakeValue();
    getAccounts();
    checkProposal();
    return () => {};
  }, [validatorlist]);
  useEffect(() => {
    validatorsList();
  }, []);
  const handleStakeSubmit = async () => {
    try {
      let stakerAmountData = bigInt(stakerAmount * 10 ** 18);
      // console.log(stakerAmountData.value, "stakerAmount");
      let result = await Proposal.stakeValidator({
        value: stakerAmountData.value,
      });
      // console.log(result, "results");
    } catch (error) {
      console.log(error);
    }
  };


  // console.log(proposalData, "proposalData");

  const minimumStakeValue = async () => {
    try {
      let initialValue = await Proposal.minimumStakeAmount();
      // console.log(initialValue, "initialValue");
      // setupdateValue(initialValue / 1000000000000000000);
    } catch (error) {
      console.log(error);
    }
  };

  const validatorsList = async () => {
    try {
      let listData = await Proposal.getHighestValidators();
      // console.log(listData, "listData");
      setValidatorlist(listData);
    } catch (error) {
      console.log(error);
    }
  };
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

  const createProposal = async () => {
    // console.log("check name", variableName);
    setShowLoader(true);
    try {
      let address = account;
      let details = "high";
      let chnageVariblr = "minimumStakeAmount";
      // let valuenum = bigInt(updateValue * 10 ** 18);
      let ethe = bigInt(1 * 10 ** 18);
      console.log("create proposal", updateValue);
      let proposalCreate = await VotingContract.createProposal(
        details,
        variableName,
        updateValue,
        { value: ethe.value }
      );
      // console.log(proposalCreate, "proposalCreate");
      let wait = await proposalCreate.wait();
      if (wait) {
        setShowLoader(false);
        toast("Proposal created successfully.");
        checkProposal();
      }
    } catch (error) {
      setShowLoader(false);

      if (error.code === 4001) {
        toast.error(error.message);
      }
      if (error.data.message) {
        toast.error(error.data.message);
      }

      console.log(error);
    }
  };

  const checkProposal = async () => {
    try {
      let checkPropsal = await VotingContract.chcekProposal();
      console.log(checkPropsal, "checkPropsal");
      setproposalList(checkPropsal);
      console.log("getproposaldetailssss", checkPropsal[0]);
      let ab = [];
      for (let j = 0; j < checkPropsal.length; j++) {
        let proposalsss = await VotingContract.proposals(checkPropsal[j]);
        // console.log("getetetetetet", proposalsss);
        // getProposalDetails(proposalList[0]);
        let newObj={
          id:checkPropsal[j],
          name:proposalsss.variable_name,
          value:proposalsss.variable_value.toString(),
          proposerAddress:proposalsss.proposer
        }
        detailsList.push(newObj)
        // console.log(proposalsss, "proposalsss");
        ab.push(proposalsss);
      }
      setProposalListData(detailsList)
      setproposalDetails(ab);
    } catch (error) {
      console.log(error);
    }
  };

  const getProposalDetails = async (id) => {
    try {
      handleOpen()
      setsenIdToVoteComp(id);
      let proposalsss = await Proposal.proposals(id);
      setProposalData(proposalsss);
      console.log(proposalData.votePowerOfAgree.toBigInt(), "proposalsss");
    } catch (error) {
      console.log(error);
    }
  };

  const copyHash = (val) => {
    console.log("side");
    navigator.clipboard.writeText(val);
    setOpenAlert(true);
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  function getStyles(name, variableName, theme) {
    return {
      fontWeight:
        variableName.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }
  const theme = useTheme();
  const [variableName, setVariableName] = React.useState("");

  const handleChange = async (event) => {
    const {
      target: { value },
    } = event;
    if (event.target.value) {
      let value = await Proposal.currentValue(event.target.value);
      if (event.target.value === "MaxValidators") {
        setcurrentValueOfselectedVar(value.toString());
      }
      if (event.target.value === "minimumStakeAmount") {
        let convrtTostring = value.toString();
        let remove18 = convrtTostring.slice(0, -18);
        setcurrentValueOfselectedVar(remove18);
      }
    }
    setVariableName(
      value
    );
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

  return (
    <>
      
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <Grid >
                <Typography variant="h5" pb={2} textAlign={"center"}>
                  Proposal details
                </Typography>
                {proposalData ? (
                  <>
                    <Card
                      sx={{
                        paddingLeft: "1rem",
                        paddingRight: "1rem",
                        boxShadow: 0,
                        backgroundColor: "#F8FAFD",
                      }}
                    >
                      <Grid
                        container
                        display={"flex"}
                        justifyContent={"space-between"}
                        pt={2}
                        pb={2}
                      >
                        <Grid item>Proposer address</Grid>
                        <Grid item>{proposalData.proposer}</Grid>
                        <Divider />
                      </Grid>

                      <Grid
                        container
                        display={"flex"}
                        justifyContent={"space-between"}
                        pt={2}
                        pb={2}
                      >
                        <Grid item>Value </Grid>
                        <Grid item>
                          {/* {console.log(
                            "cheehhskhskhs",
                            proposalData.variable_value.toString()
                          )} */}
                          {proposalData.variable_name === "MaxValidators"
                            ? proposalData.variable_value.toString()
                            : proposalData.variable_value.toString() /
                              1000000000000000000}
                        </Grid>
                        <Divider />
                      </Grid>

                      <Grid
                        container
                        display={"flex"}
                        justifyContent={"space-between"}
                        pt={2}
                        pb={2}
                      >
                        <Grid item>Name </Grid>
                        <Grid item>{proposalData.variable_name}</Grid>
                        <Divider />
                      </Grid>

                      <Grid
                        container
                        display={"flex"}
                        justifyContent={"space-between"}
                        pt={2}
                        pb={2}
                      >
                        <Grid item>Status </Grid>
                        <Grid item>
                          {proposalData[11] === true ? "True" : "False"}
                        </Grid>
                        <Divider />
                      </Grid>
                    </Card>
                  </>
                ) : (
                  <>
                    <Typography sx={{ textAlign: "center", mt: 5 }}>
                      No data found
                    </Typography>{" "}
                  </>
                )}
              </Grid>

              <Grid container sx={{p:2}}>
                <Grid item md={12} sm={12} xs={12}>
                  <Vote data={senIdToVoteComp} />
                </Grid>
              </Grid>
          </Box>
        </Fade>
      </Modal>
    </div>

      <ToastContainer />
      {/* <Grid container sx={{pl:7,pr:7}}>
        <Grid xs={12} sm={12} md={12}>
          <Card sx={{ mt: 3, backgroundColor: "#F8FAFD", boxShadow: 1 }} item>
            <Box sx={{ flexFlow: 1, p: 2 }}>
              <Typography variant="h5" pb={2} sx={{ textAlign: "center" }}>
                All proposal list
              </Typography>
              <Divider />

              <div >
                {proposalListData ? (
                  proposalListData.map((val, key) => {
                    return (
                      <>
                        <Grid container sx={{ display: "flex" ,alignItems:'center',textAlign:'center'}}>
                          <Grid xs={1}>
                            {key+1}
                          </Grid>
                          <Grid item xs={3}>
                            {val.name}
                          </Grid>

                          <Grid item xs={2}>
                            {val.value<51?val.value:val.value/1000000000000000000}
                          </Grid>

                          <Grid item xs={2}>
                            <div style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
                            <Typography
                              sx={{
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                              }}
                              pt={1}
                            >
                              {shortenAccountId(val.id)}{" "}
                            </Typography>
                            </div>
                          </Grid>
                          <Grid xs={1} pt={1}>
                            <span>
                              <ContentCopyIcon
                                style={{
                                  marginLeft: "0.5rem",
                                  cursor: "pointer",
                                }}
                                onClick={() => copyHash(val.id)}
                              />
                            </span>
                          </Grid>
                          {openAlert ? (
                            <Snackbar
                              open={openAlert}
                              autoHideDuration={2000}
                              onClose={() => setOpenAlert(false)}
                            >
                              <Alert
                                onClose={() => setOpenAlert(false)}
                                severity="info"
                              >
                                Hash Copied
                              </Alert>
                            </Snackbar>
                          ) : null}
                          <Grid
                            item
                            xs={3}
                            sx={{ display: "flex", justifyContent: "center" }}
                          >
                            <Button
                              variant="outlined"
                              onClick={() => getProposalDetails(val.id)}
                            >
                              Info
                            </Button>
                          </Grid>
                        </Grid>
                        <Divider />
                      </>
                    );
                  })
                ) : (
                  <>
                    <Typography sx={{ textAlign: "center", m: 2 }}>
                      No data found
                    </Typography>{" "}
                  </>
                )}
              </div>
            </Box>
          </Card>
        </Grid>
      </Grid> */}
          <Typography variant="h5" sx={{ display:"flex",justifyContent:"center" }}>
              All proposal list
            </Typography>
       {  proposalListData!=undefined?

        <Grid container sx={{pl:7,pr:7}}>
          <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650, p: 2 }} aria-label="simple table">
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
                      <TableBody>
                        {
                          proposalListData ? 
                          proposalListData.map((val,key)=>{
                            return(
                              <>
                              <TableRow>
                                <TableCell>
                                  {key+1}
                                </TableCell>

                                <TableCell>
                                  {val.name}
                                </TableCell>

                                <TableCell>
                                {val.value<51?val.value:val.value/1000000000000000000}
                                </TableCell>

                                <TableCell>
                                  {val.proposerAddress}
                                {/* {shortenAccountId(val.proposerAddress)}{" "} */}
                                </TableCell>

                                {/* <TableCell>
                                  <ContentCopyIcon
                                    style={{
                                      marginLeft: "0.5rem",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => copyHash(val.id)}
                                  />
                                </TableCell> */}

                                {openAlert ? (
                                <Snackbar
                                  open={openAlert}
                                  autoHideDuration={2000}
                                  onClose={() => setOpenAlert(false)}
                                >
                                  <Alert
                                    onClose={() => setOpenAlert(false)}
                                    severity="info"
                                  >
                                    Hash Copied
                                  </Alert>
                                </Snackbar>
                              ) : null}

                                <TableCell>
                                  <Button
                                    variant="outlined"
                                    onClick={() => getProposalDetails(val.id)}
                                  >
                                    Info
                                  </Button>
                                </TableCell>

                              </TableRow>
                              </>
                            )
                          })
                          : (
                            <>
                              <Typography sx={{ textAlign: "center", m: 2 }}>
                                No data found
                              </Typography>{" "}
                            </>
                          )
                        }
                      
                      </TableBody>
                  </Table> 
          </TableContainer>
        </Grid>
      :
      <>  
      <div className="voting_loader">
        <Box >
          <CircularProgress />
        </Box>
      </div>
      </>
}
    </>
  );
};

export default Voting;
