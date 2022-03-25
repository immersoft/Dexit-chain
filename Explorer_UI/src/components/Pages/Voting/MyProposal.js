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
import Backdrop from '@mui/material/Backdrop';


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


export default function MyProposal() {
  useEffect(() => {
    myProposalListFunc();
    return () => {};
  }, []);

  const [myProposal, setmyProposal] = useState([]);
  const [myProposalDetails, setmyProposalDetails] = useState();
  const [openAlert, setOpenAlert] = React.useState(false);
  let [proposalData, setProposalData] = useState();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);


  const getProposalDetails = async (id) => {
      // console.log("calll")
    try {
      let proposalsss = await Proposal.proposals(id);
      // console.log(proposalsss, "proposalsss");
      setProposalData(proposalsss);
      setmyProposalDetails(proposalsss)
      handleOpen()
    } catch (error) {
      console.log(error);
    }
  };

  const myProposalListFunc = async () => {
    let result = await Proposal.userProposal();
    console.log("result", result);
    setmyProposal(result);
    let proposalsss = await Proposal.proposals(result[0]);
    console.log("proposalalala", proposalsss);
    setmyProposalDetails(proposalsss);
  };

  const copyHash = (val) => {
    console.log("side");
    navigator.clipboard.writeText(val);
    setOpenAlert(true);
  };

  return (
    <>
      <div>
      {/* <Button onClick={handleOpen}>Open modal</Button> */}
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
              <Typography variant="h5"  pb={2} textAlign={"center"}>
                Proposal details
              </Typography>
              {myProposalDetails ? (
                <>
                  <Card
                    sx={{
                      paddingLeft: "1rem",
                      paddingRight: "1rem",
                      boxShadow: 3,
                      backgroundColor:'#F8FAFD'
                    }}
                  >
                    <Grid
                      container
                      display={"flex"}
                      justifyContent={"space-between"}
                      pt={2}
                      pb={2}
                    >
                      <Grid item ml={3}>
                        Proposer address
                      </Grid>
                      <Grid item>{myProposalDetails.proposer}</Grid>
                      <Divider />
                    </Grid>

                    <Grid
                      container
                      display={"flex"}
                      justifyContent={"space-between"}
                      pt={2}
                      pb={2}
                    >
                      <Grid item ml={3}>
                        Value{" "}
                      </Grid>
                      <Grid item>
                      {myProposalDetails.variable_name ==='MaxValidators'?myProposalDetails.variable_value.toString(): myProposalDetails.variable_value.toString() /
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
                      <Grid item ml={3}>
                        Name{" "}
                      </Grid>
                      <Grid item>{myProposalDetails.variable_name}</Grid>
                      <Divider />
                    </Grid>

                    <Grid
                      container
                      display={"flex"}
                      justifyContent={"space-between"}
                      pt={2}
                      pb={2}
                    >
                      <Grid item ml={3}>
                        Status{" "}
                      </Grid>
                      <Grid item>
                        {myProposalDetails[11] === true ? "True" : "False"}
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
          </Box>
        </Fade>
      </Modal>
    </div>


    <Grid container display={"flex"} justifyContent="center" sx={{p:2}}>
      <Grid xs={12} sm={12} md={12} >
        <Card sx={{ mt: 3,   px: 3 ,background:'#F8FAFD'}} item>
          <Box sx={{ flexFlow: 1, p: 2 }}>
            <Typography variant="h5" pb={2} sx={{ textAlign: "center" }}>
              My proposal list
            </Typography>
            <Divider />
            <div style={{ maxHeight: "335px",minHeight:'200px', overflow: "scroll" }}>
              {myProposal.length > 0 ? (
                myProposal.map((val, key) => {
                  return (
                    <>
                      <Grid container sx={{ display: "flex" }}>
                        <Grid item xs={8}>
                          <div style={{display:"flex",justifyContent:"space-evenly",alignItems:"center"}}>
                            <Typography
                              sx={{
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                              }}
                              pt={1}
                            >
                              {val}{" "}
                            </Typography>
                            <span style={{alignItems:"center",display:"flex",marginTop:"0.1rem"}}>
                              <ContentCopyIcon
                                style={{
                                  marginLeft: "0.5rem",
                                  cursor: "pointer",
                                }}
                                onClick={() => copyHash(val)}
                              />
                            </span>
                          </div>
                        </Grid>
                        {/* <Grid xs={1} pt={1}>
                          <span>
                            <ContentCopyIcon
                              style={{
                                marginLeft: "0.5rem",
                                cursor: "pointer",
                              }}
                              onClick={() => copyHash(val)}
                            />
                          </span>
                        </Grid> */}
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
            {/* <Grid >
              <Typography variant="h5" pt={3} pb={2} textAlign={"center"}>
                Proposal details
              </Typography>
              {myProposalDetails ? (
                <>
                  <Card
                    sx={{
                      paddingLeft: "1rem",
                      paddingRight: "1rem",
                      boxShadow: 3,
                      backgroundColor:'#F8FAFD'
                    }}
                  >
                    <Grid
                      container
                      display={"flex"}
                      justifyContent={"space-between"}
                      pt={2}
                      pb={2}
                    >
                      <Grid item ml={3}>
                        Proposer address
                      </Grid>
                      <Grid item>{myProposalDetails.proposer}</Grid>
                      <Divider />
                    </Grid>

                    <Grid
                      container
                      display={"flex"}
                      justifyContent={"space-between"}
                      pt={2}
                      pb={2}
                    >
                      <Grid item ml={3}>
                        Value{" "}
                      </Grid>
                      <Grid item>
                      {myProposalDetails.variable_name ==='MaxValidators'?myProposalDetails.variable_value.toString(): myProposalDetails.variable_value.toString() /
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
                      <Grid item ml={3}>
                        Name{" "}
                      </Grid>
                      <Grid item>{myProposalDetails.variable_name}</Grid>
                      <Divider />
                    </Grid>

                    <Grid
                      container
                      display={"flex"}
                      justifyContent={"space-between"}
                      pt={2}
                      pb={2}
                    >
                      <Grid item ml={3}>
                        Status{" "}
                      </Grid>
                      <Grid item>
                        {myProposalDetails[11] === true ? "True" : "False"}
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
            </Grid> */}
          </Box>
        </Card>
      </Grid>
    </Grid>
    </>
  );
}
