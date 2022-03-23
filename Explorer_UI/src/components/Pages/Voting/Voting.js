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
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useTheme } from "@mui/material/styles";
import OutlinedInput from "@mui/material/OutlinedInput";
import React, { useState, useEffect } from "react";
import Proposal from "../../../Contract";
import bigInt from "big-integer";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Vote from "./Vote";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { ToastContainer, toast } from "react-toastify";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const Voting = () => {
  const [stakerAmount, setStakerAmount] = useState("");
  const [validatorlist, setValidatorlist] = useState([]);
  let [account, setAccount] = useState("");
  let [updateValue, setupdateValue] = useState(0);
  let [proposalList, setproposalList] = useState([]);
  let [proposalDetails, setproposalDetails] = useState([]);
  let [proposalData, setProposalData] = useState();
  let [miniValue, setMiniValue] = useState();
  const [openAlert, setOpenAlert] = React.useState(false);
  const [senIdToVoteComp, setsenIdToVoteComp] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const [currentValueOfselectedVar, setcurrentValueOfselectedVar] =
    useState("");

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
      let proposalCreate = await Proposal.createProposal(
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
      let checkPropsal = await Proposal.chcekProposal();
      // console.log(checkPropsal, "checkPropsal");
      setproposalList(checkPropsal);
      // console.log("getproposaldetailssss", checkPropsal[0]);
      let ab = [];
      for (let j = 0; j < checkPropsal.length; j++) {
        let proposalsss = await Proposal.proposals(checkPropsal[j]);
        // console.log("getetetetetet", proposalsss[0]);
        getProposalDetails(proposalList[0]);

        // console.log(proposalsss, "proposalsss");
        ab.push(proposalsss);
      }
      setproposalDetails(ab);
    } catch (error) {
      console.log(error);
    }
  };

  const getProposalDetails = async (id) => {
    try {
      setsenIdToVoteComp(id);
      let proposalsss = await Proposal.proposals(id);
      // console.log(proposalsss, "proposalsss");
      setProposalData(proposalsss);
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
    // console.log("eevevvve", event.target.value);

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
      // On autofill we get a stringified value.
      // typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <>
      
      <ToastContainer />
      <Typography variant='h4' style={{ textAlign: "center" }}>Voting</Typography>
      <Grid container>
        <Grid xs={12} sm={12} md={12}>
          <Card sx={{ mt: 3, backgroundColor: "#F8FAFD", boxShadow: 1 }} item>
            <Box sx={{ flexFlow: 1, p: 2 }}>
              <Typography variant="h5" pb={2} sx={{ textAlign: "center" }}>
                All proposal list
              </Typography>
              <Divider />
              <div style={{ maxHeight: "195px", overflow: "scroll" }}>
                {proposalList.length > 0 ? (
                  proposalList.map((val, key) => {
                    return (
                      <>
                        <Grid container sx={{ display: "flex" }}>
                          <Grid item xs={8}>
                            <Typography
                              sx={{
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                              }}
                              pt={1}
                            >
                              {val}{" "}
                            </Typography>
                          </Grid>
                          <Grid xs={1} pt={1}>
                            <span>
                              <ContentCopyIcon
                                style={{
                                  marginLeft: "0.5rem",
                                  cursor: "pointer",
                                }}
                                onClick={() => copyHash(val)}
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
                            sx={{ display: "flex", justifyContent: "end" }}
                          >
                            <Button
                              variant="outlined"
                              onClick={() => getProposalDetails(val)}
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
              <Grid>
                <Typography variant="h5" pt={3} pb={2} textAlign={"center"}>
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
                          {console.log(
                            "cheehhskhskhs",
                            proposalData.variable_value.toString()
                          )}
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
                        {/* {console.log(proposalData[11].toString(),"kkkkkk")} */}
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
            </Box>
          </Card>
        </Grid>
      </Grid>
      <Grid container sx={{ backgroundColor: "#F8FAFD" }}>
        <Grid item md={12} sm={12} xs={12}>
          <Vote data={senIdToVoteComp} />
        </Grid>
      </Grid>
    </>
  );
};

export default Voting;