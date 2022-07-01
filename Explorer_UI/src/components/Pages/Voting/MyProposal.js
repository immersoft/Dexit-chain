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
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useTheme } from "@mui/material/styles";
import OutlinedInput from "@mui/material/OutlinedInput";
import React, { useState, useEffect } from "react";
import Proposal from "../../../Proposal";
import bigInt from "big-integer";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Vote from "./Vote";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { ToastContainer, toast } from "react-toastify";
import Backdrop from '@mui/material/Backdrop';
import './Voting.css'


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
  { id: "details", label: "Detail", minWidth: 50 },
  { id: "info", label: "More Info", minWidth: 50 }
];


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
  let newObjectarray=[]
  let proposalId=[]
  const[allInfo,setAllInfo]=useState()
  const[allNewInfo,setAllNewInfo]=useState()


  const getProposalDetails = async (id) => {
      // console.log("calll")
    try {
      let proposalsss = await Proposal.proposals(id);
      console.log(proposalsss)
      let newObject={
        id:id,
        name:proposalsss.variable_name,
        details:proposalsss.details,
        value:proposalsss.variable_value.toString(),
        address:proposalsss.proposer,
        status:proposalsss[11]

      }
      // proposalId.push(newObject)
      // setAllNewInfo(newObject)
      setProposalData(proposalsss);
      setmyProposalDetails(newObject)
      handleOpen()
    } catch (error) {
      console.log(error);
    }
  };

      console.log(allNewInfo, "proposalsss");


  const myProposalListFunc = async () => {
    let result = await Proposal.userProposal();
    // console.log("result", result);
    myOwnProposalList(result)
    setmyProposal(result);
    let proposalsss = await Proposal.proposals(result[0]);
    // console.log("proposalalala", proposalsss);
    setmyProposalDetails(proposalsss);
  };


  const myOwnProposalList=async(result)=>{
    console.log(result)

    for(let i=0;i<result.length;i++){
      let proposalsss = await Proposal.proposals(result[i]);
    let newObject={
      id:result[i],
      name:proposalsss.variable_name,
      details:proposalsss.details,
      value:proposalsss.variable_value.toString(),
    }
    newObjectarray.push(newObject)
    }
    setAllInfo(newObjectarray)
  }

  // console.log("proposalalala", allInfo);

  const copyHash = (val) => {
    console.log("side");
    navigator.clipboard.writeText(val);
    setOpenAlert(true);
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
                      <Grid item>{myProposalDetails.address}</Grid>
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
                        Proposer ID
                      </Grid>
                      <Grid item sx={{alignItems:"center"}}>
                        {shortenAccountId(myProposalDetails.id)}
                        <ContentCopyIcon
                            style={{
                              cursor: "pointer",
                              marginLeft: "1rem",
                              }}
                              onClick={() => copyHash(myProposalDetails.id)}
                          />

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
                              ) : null
                              }

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
                        Value{" "}
                      </Grid>
                      <Grid item>
                      {myProposalDetails.name ==='MaxValidators'?myProposalDetails.value: myProposalDetails.value /1000000000000000000}

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
                      <Grid item>{myProposalDetails.name}</Grid>
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
                        {myProposalDetails.status === true ? "True" : "False"}
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
            {/* <div style={{ maxHeight: "335px",minHeight:'200px', overflow: "scroll" }}>
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
            </div> */}

              {allInfo !=undefined?
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
                  {allInfo ? allInfo.map((item,index)=>{
                    return(
                      <TableRow>
                        <TableCell>
                          {index+1}
                        </TableCell>

                        <TableCell>
                          {item.name}
                        </TableCell>

                        <TableCell>
                          {item.value<51?item.value:item.value/1000000000000000000}
                        </TableCell>

                        <TableCell>
                          {item.details}
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="outlined"
                            onClick={() => getProposalDetails(item.id)}
                          >
                            Info
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  }):

                  <div style={{textAlign:"center",margin:"15%"}}>
                    <Typography variant="h5">No Transaction Found</Typography>
                  </div>
                }
                
                </TableBody>
              </Table> 
        </TableContainer>
            </Grid>

            :
            <>           
             <div className="voting_loader">
              <Box>
                <CircularProgress />
              </Box>
            </div>
            </>

      }
              
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
