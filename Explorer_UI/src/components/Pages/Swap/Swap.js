import { Box, Button, Card, FormControl, Grid, MenuItem, Select, TextField, Typography } from '@mui/material'
import React from 'react'
import SwapCallsIcon from '@mui/icons-material/SwapCalls';

const Swap = () => {
    const [fromValue, setFromValue] = React.useState('');
    const [toValue, setToValue] = React.useState('');
    const[enteredAmount,setEnteredAmount]=React.useState(0)
    const[swapAmount,setSwapAmount]=React.useState(0)

    const handleChange = (event) => {
        setFromValue(event.target.value);
    };

    const handleToChange = (event) => {
        setToValue(event.target.value);
    };

  return (
    <>
     <div
        className="stack_modal"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Card sx={{ p: 2, boxShadow: "none", width: "600px"}}>
          <Box sx={{ flexGrow: 1, boxShadow: 3 }} p={3}>
            <Typography variant="h4" sx={{ textAlign: "center" }}>
              Swap
            </Typography>
            <Grid container sx={{mt:2}}>
                <Grid item xs={6} md={7} sx={{display:"flex",justifyContent:"center"}}>
                    <TextField
                    id="outlined-basic"
                    label="Amount"
                    variant="outlined"
                    value={enteredAmount}
                    onChange={(e)=>setEnteredAmount(e.target.value)}
                />
                </Grid>
                <Grid item xs={6} md={5} sx={{display:"flex",justifyContent:"center"}}>
                <FormControl>
                    <Select
                    value={fromValue}
                    onChange={handleChange}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label' }}
                    >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value={10}>ETH</MenuItem>
                    <MenuItem value={20}>BNB</MenuItem>
                    <MenuItem value={30}>DXT</MenuItem>
                    </Select>
                </FormControl>
                </Grid>
            </Grid>

            <Grid container sx={{mt:2}}>
                <Grid xs={12} md={12} sx={{display:"flex",justifyContent:"center"}}>
                    <SwapCallsIcon  sx={{fontSize:'4rem'}}/>
                </Grid>
            </Grid>

            <Grid container sx={{mt:2}}>
                <Grid item xs={6} md={7} sx={{display:"flex",justifyContent:"center"}}>
                    <TextField
                    id="outlined-basic"
                    label="Amount"
                    variant="outlined"
                    value={swapAmount}
                    onChange={(e)=>setSwapAmount(e.target.value)}
                />
                </Grid>
                <Grid item xs={6} md={5} sx={{display:"flex",justifyContent:"center"}}>
                <FormControl>
                    <Select
                    value={toValue}
                    onChange={handleToChange}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label' }}
                    >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value={10}>ETH</MenuItem>
                    <MenuItem value={20}>BNB</MenuItem>
                    <MenuItem value={30}>DXT</MenuItem>
                    </Select>
                </FormControl>
                </Grid>
            </Grid>


            <Grid container sx={{mt:2}}>
                <Grid xs={12} md={12} sx={{display:"flex",justifyContent:"center"}}>
                    <Button variant="contained">Swap</Button>
                </Grid>
            </Grid>
          </Box>
        </Card>
      </div>

    </>
  )
}

export default Swap