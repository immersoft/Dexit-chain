import React, { useEffect,useState } from 'react'
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import { Button, Card } from '@mui/material';
import { Box } from '@mui/system';
import moment from 'moment';
import './singleTransaction.css'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useLocation } from 'react-router-dom';


const SingleTransactionDetails = () => {
    const location = useLocation();
    // const [getSingleBlock,setSingleBlock]=useState()
    // setSingleBlock(location.state.row)
    // console.log(location.state.row)
  const navigate=useNavigate();

    const singleBlock=location.state.row
    console.log(singleBlock, "single block component")
    console.log(singleBlock.number, "single block component")
    // console.log(getSingleBlock, " block component")

    // console.log(singleBlock.singleBlock.number, "single block component")

    const handleChangeState=()=>{
        navigate('/')
      }

  return (
    <>
    { singleBlock ?
        <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
          <ArrowBackIcon onClick={handleChangeState} fontSize="large" sx={{mt:3}}/>

                <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableBody>


                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left">Block Number :</TableCell>
                        <TableCell align="left">{singleBlock.number}</TableCell>
                    </TableRow>

                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left"  >Time Stamp :</TableCell>
                        <TableCell align="left">{moment.unix(singleBlock.timestamp).format("YYYY-MM-DD h:mm:ss a")}</TableCell>
                    </TableRow>


                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left"  >Transactions :</TableCell>
                        <TableCell align="left"><Button id="btn" variant="outlined" href="#outlined-buttons" size='small'>{singleBlock.transactions.length} transactions</Button></TableCell>
                    </TableRow>
                      

                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left"  >Difficulty :</TableCell>
                        <TableCell align="left">{singleBlock.difficulty}</TableCell>
                    </TableRow>

                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left"  >Total Difficulty :</TableCell>
                        <TableCell align="left">{singleBlock.totalDifficulty}</TableCell>
                    </TableRow>

                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left"  >Gas Used :</TableCell>
                        <TableCell align="left">{singleBlock.gasUsed}</TableCell>
                    </TableRow>

                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left"  >Gas Limit :</TableCell>
                        <TableCell align="left">{singleBlock.gasLimit}</TableCell>
                    </TableRow>

                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left">Extra Data :</TableCell>
                        <TableCell align="left">Hex: {singleBlock.extraData}</TableCell>
                    </TableRow>


                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left"  >Hash :</TableCell>
                        <TableCell align="left">{singleBlock.hash}</TableCell>
                    </TableRow>

                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left"  >Parent Hash :</TableCell>
                        <TableCell align="left">{singleBlock.parentHash}</TableCell>
                    </TableRow>

                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left"  >Sha3Uncles :</TableCell>
                        <TableCell align="left">{singleBlock.sha3Uncles}</TableCell>
                    </TableRow>

                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell align="left" >Nonce :</TableCell>
                        <TableCell align="left">{singleBlock.nonce}</TableCell>
                    </TableRow>

                    </TableBody>
                </Table>
            </TableContainer>
                </Box>
        </Card>
    : "not get"
    }
    </>
  )
}

export default SingleTransactionDetails



