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
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import VotingContract from "../../../AllContract/Voting";

import React, { useState, useEffect } from "react";
import Proposal from "../../../Proposal";
import bigInt from "big-integer";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import LoadingButton from "@mui/lab/LoadingButton";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const Vote = (props) => {
  let { data } = props;
  const [openAlert, setOpenAlert] = React.useState(false);

  const [stakerAmount, setStakerAmount] = useState("");
  const [validatorlist, setValidatorlist] = useState([]);
  let [account, setAccount] = useState("");
  let [updateValue, setupdateValue] = useState(0);
  let [proposalList, setproposalList] = useState([]);
  let [proposalDetails, setproposalDetails] = useState([]);
  let [proposalData, setProposalData] = useState();
  let [miniValue, setMiniValue] = useState();
  let [proposalId, setProposalId] = useState(data);
  const [submitProposalIconColor, setsubmitProposalIconColor] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [showWarning, setshowWarning] = useState("");

  useEffect(() => {
    minimumStakeValue();
    getAccounts();
    setProposalId(data);

    return () => {};
  }, []);
  useEffect(() => {
    setProposalId(data);
    return () => {};
  }, [props]);

  // const handleStakeSubmit = async () => {
  //   console.log("stake submit");
  //   try {
  //     let stakerAmountData = bigInt(stakerAmount * 10 ** 18);
  //     console.log(stakerAmountData.value, "stakerAmount");
  //     let result = await Proposal.stakeValidator({
  //       value: stakerAmountData.value,
  //     });
  //     console.log(result, "results");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const minimumStakeValue = async () => {
    try {
      let initialValue = await Proposal.minimumStakeAmount();
      // console.log(initialValue, "initialValue");
      setupdateValue(initialValue / 1000000000000000000);
    } catch (error) {
      console.log(error);
    }
  };

  const validatorsList = async () => {
    try {
      let listData = await Proposal.getHighestValidators();
      console.log(listData, "listData");
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

  const copyHash = (val) => {
    console.log("side");
    navigator.clipboard.writeText(val);
    setOpenAlert(true);
  };

  const submitProposal = async () => {
    setShowLoader(true);
    setshowWarning("");
    if (submitProposalIconColor === null || !proposalId) {
      setShowLoader(false);
      return toast.warning("Please select Like or Unlike & Proposal id.");
    }
    try {
      let submit = await VotingContract.voteProposal(
        proposalId,
        submitProposalIconColor.toString()
      );
      console.log(submit, "submit");
      let waitfor = await submit.wait();
      if (waitfor) {
        setShowLoader(false);

        proposalVotedetails();
        toast.success("Voting success.");
      }
    } catch (error) {
      setShowLoader(false);
      if (error.code === 4001) {
        toast.error(error.message);
      }
      if (error.data.message) {
        toast.error(error.data.message);
      }
    }
  };
  const proposalVotedetails = async () => {
    let proposalVotedetails = await Proposal.proposals(proposalId);
  };

  return (
    <>
      {/* <ToastContainer /> */}

      <Card sx={{ mt: 3, boxShadow: 3, pb: 1, backgroundColor: "#F8FAFD" }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h5"
            pt={2}
            pb={2}
            sx={{ textAlign: "center", fontWeight: "500" }}
          >
            Voting
          </Typography>
          <div
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "center",
              marginTop: "0.8rem",
            }}
          >
            <TextField
              id="outlined-basic"
              label="Proposal Id:"
              variant="outlined"
              sx={{ mt: 1, width: "90%" }}
              value={proposalId}
            />

            <ContentCopyIcon
              style={{
                cursor: "pointer",
              }}
              onClick={() => copyHash(proposalId)}
            />

            {openAlert ? (
              <Snackbar
                open={openAlert}
                autoHideDuration={2000}
                onClose={() => setOpenAlert(false)}
              >
                <Alert onClose={() => setOpenAlert(false)} severity="info">
                  Hash Copied
                </Alert>
              </Snackbar>
            ) : null}
          </div>
          <div
            style={{ display: "flex", justifyContent: "center", padding: "2%" }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <ThumbDownIcon
                fontSize="large"
                color={submitProposalIconColor === false ? "primary" : ""}
                onClick={() => {
                  setsubmitProposalIconColor(false);
                }}
              />
              <ThumbUpIcon
                sx={{ ml: 2 }}
                fontSize="large"
                color={submitProposalIconColor === true ? "primary" : ""}
                onClick={() => {
                  setsubmitProposalIconColor(true);
                }}
              />
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            {/* {showWarning ===
            "execution reverted: You can't vote for a proposal twice" ? (
              <Grid
                item
                xs={12}
                mb={3}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Alert severity="warning" color="error">
                  You can't vote for a proposal twice!
                </Alert>
              </Grid>
            ) : (
              ""
            )} */}
            {showLoader === true ? (
              <LoadingButton
                sx={{ paddingLeft: "1.3rem", paddingRight: "1.3rem" }}
                color="primary"
                loading
                variant="outlined"
              >
                Submit
              </LoadingButton>
            ) : (
              <Button variant="outlined" onClick={() => submitProposal()}>
                Submit
              </Button>
            )}
          </div>
        </Box>
      </Card>
    </>
  );
};

export default Vote;
