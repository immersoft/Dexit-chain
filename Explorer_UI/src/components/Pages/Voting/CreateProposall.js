import {
  Button,
  TextField,
  Card,
  Box,
  Divider,
  Typography,
  Grid,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import React, { useState, useEffect } from "react";
import Proposal from "../../../Proposal";
import Contract from "../../../Contract";
import bigInt from "big-integer";
import { ToastContainer, toast } from "react-toastify";

export default function CreateProposall() {
  const [updateValue, setupdateValue] = useState(0);
  const [variableName, setVariableName] = React.useState("");
  const [showLoader, setShowLoader] = useState(false);
  const [proposalDetails, setProposalDetails] = useState("");
  const [currentValueOfselectedVar, setcurrentValueOfselectedVar] =
    useState("");
  const variableNames = ["minimumStakeAmount", "MaxValidators"];

  const handleChange = async (event) => {
    // console.log("eevevvve", event.target.value);

    const {
      target: { value },
    } = event;
    if (event.target.value) {
      // let value = await Proposal.currentValue(event.target.value);
      if (event.target.value === "MaxValidators") {
        let MaxVal = await Contract.MaxValidators();
        console.log("this is MaxValidators : ",MaxVal);
        setcurrentValueOfselectedVar(MaxVal.toString());
      }
      if (event.target.value === "minimumStakeAmount") {
        let minAmount = await Contract.minimumStakeAmount();
        let convrtTostring = minAmount.toString();
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
  const createProposal = async () => {
    // console.log("check name", variableName);
    setShowLoader(true);
    try {
      let ethe = bigInt(1 * 10 ** 18);
      console.log("create proposal", updateValue);
      let proposalCreate = await Proposal.createProposal(
        proposalDetails,
        variableName,
        updateValue,
        { value: ethe.value }
      );
      // console.log(proposalCreate, "proposalCreate");
      let wait = await proposalCreate.wait();
      if (wait) {
        setShowLoader(false);
        toast("Proposal created successfully.");
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
  return (
    <>
      <ToastContainer />
      <Grid container sx={{ p: 1 }} display='flex' justifyContent='center'>
        <Grid xs={12} sm={12} md={6} sx={{ p: 1 }}>
          <Card item sx={{ mt: 3, boxShadow: 3,backgroundColor:'#F8FAFD'  }}>
            <Box sx={{ flexFlow: 1, p: 2 }}>
              <Typography variant="h5" pb={2} sx={{ textAlign: "center" }}>
                Create Proposal
              </Typography>
              <Divider />

              <Grid container pt={1}>
                {/* <Grid
                  item
                  xs={12}
                  ml={3}
                  mr={3}
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <label
                    htmlFor="validatorAddress"
                    style={{ paddingTop: "1rem", fontSize: "1.1rem" }}
                  >
                    Validator Address
                  </label>
                  <TextField
                    id="outlined-basic"
                    label="Enter your address"
                    variant="outlined"
                    sx={{ my: 1 }}
                  />
                </Grid> */}
                <Grid
                  item
                  xs={12}
                  ml={3}
                  mr={3}
                  sx={{ display: "flex", justifyContent: "space-between",alignItems:'center' }}
                >
                  <label
                    htmlFor="validatorAddress"
                    style={{ paddingTop: "1rem", fontSize: "1.1rem" }}
                  >
                    Details
                  </label>
                  <TextField
                    id="outlined-basic"
                    variant="outlined"
                    label="Enter details"
                    sx={{ my: 1 }}
                    value={proposalDetails}
                    onChange={(e)=>setProposalDetails(e.target.value)}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  ml={3}
                  mr={3}
                  sx={{ display: "flex", justifyContent: "space-between",alignItems:'center' }}
                >
                  <label
                    htmlFor="validatorAddress"
                    style={{ paddingTop: "1rem", fontSize: "1.1rem" }}
                  >
                    Variable name
                  </label>
                  <FormControl sx={{ minWidth: 222 }}>
                    <Select
                      value={variableName}
                      onChange={handleChange}
                      displayEmpty
                      inputProps={{ "aria-label": "Without label" }}
                    >
                      <MenuItem value="">
                        <span>Select</span>
                      </MenuItem>
                      {variableNames.map((e) => {
                        return <MenuItem value={e}>{e}</MenuItem>;
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid
                  item
                  xs={12}
                  ml={3}
                  mr={3}
                  mt={1}
                  sx={{ display: "flex", justifyContent: "space-between",alignItems:'center' }}
                >
                  <label
                    htmlFor="validatorAddress"
                    style={{ paddingTop: "1rem", fontSize: "1.1rem" }}
                  >
                    Set Value
                  </label>
                  <TextField
                    id="outlined-basic"
                    label="Staker Amount"
                    variant="outlined"
                    sx={{ mt: 1 }}
                    value={updateValue}
                    onChange={(e) => setupdateValue(e.target.value)}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  ml={3}
                  mr={3}
                  sx={{ display: "flex", justifyContent: "space-between",alignItems:'center' }}
                >
                  <label
                    htmlFor="selectedVar"
                    style={{ paddingTop: "1rem", fontSize: "1.1rem" }}
                  >
                    Amount of selected variable
                  </label>
                  <Typography
                    sx={{
                      textAlign: "center",
                      width: 230,
                      mt: 2,
                      color: "#808080",
                      fontSize: "1.3rem",
                      fontWeight: "bold",
                    }}
                  >
                    {currentValueOfselectedVar ? currentValueOfselectedVar : "null"}
                  </Typography>
                </Grid>
              </Grid>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "2%",
                }}
              >
                {showLoader === true ? (
                  <LoadingButton
                    sx={{
                      paddingLeft: "3.4rem",
                      paddingRight: "3.4rem",
                      mt: 5,
                    }}
                    color="primary"
                    loading
                    variant="outlined"
                  >
                    Submit
                  </LoadingButton>
                ) : (
                  <Button
                    variant="outlined"
                    sx={{ mt: 5 }}
                    onClick={() => createProposal()}
                  >
                    Create Proposal
                  </Button>
                )}
              </div>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
