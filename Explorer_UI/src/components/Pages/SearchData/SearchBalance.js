import React, { useEffect,useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Box, Card,Divider,Grid,Typography } from '@mui/material'
import './SearchBalance.css'
import BalanceTab from './BalanceTab'

const SearchBalance = () => {
    const location=useLocation()
    const getDetails=location.state.balance
    const accountAddress=location.state.account
    const[currentPrice,setCurrentPrice]=useState(0)
    console.log(getDetails,"getDetails")

    async function fetchDXTDetails() {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/dexit-finance"
        );
        if (response.status === 200) {
          const res = await response.json();
          setCurrentPrice(res.market_data.current_price.usd);
        }
      }

    useEffect(()=>{
        fetchDXTDetails()
    },[])

  return (
    <>
        <Card sx={{boxShadow:"none !important",p:3,background:"#F8FAFD"}}>
            <Box>
                <Grid container sx={{mt:2}}>
                    <Grid xs={12} md={2} >
                        <Typography className='address_label'>Address:{' '}</Typography>
                    </Grid>
                    <Grid xs={12} md={10}>
                        <Typography className='address_size'>{accountAddress}</Typography>
                    </Grid>
                </Grid>
                <Divider sx={{mt:3}}/>

                <Grid container sx={{p:3}}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{ p: 3}}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography>Overview</Typography>
                                <Divider sx={{mt:1}}/>
                                <Grid container sx={{mt:2}}>
                                    <Grid xs={12} md={4}>
                                        <Typography>Balance :</Typography>
                                    </Grid>
                                    <Grid xs={12} md={8}>
                                        <Typography>{getDetails.slice(0,-18)}{" "}DXT</Typography>
                                    </Grid>
                                </Grid>
                                <Divider sx={{mt:2}}/>

                                <Grid container sx={{mt:2}}>
                                    <Grid xs={12} md={4}>
                                        <Typography>DXT Value :</Typography>
                                    </Grid>
                                    <Grid xs={12} md={8}>
                                        {
                                            currentPrice?
                                        <Typography>${(getDetails.slice(0,-18)) * (currentPrice)}{" "}</Typography>
                                        :
                                        <Typography>Loading</Typography>
                                        }
                                    </Grid>
                                </Grid>

                            </Box>
                        </Card>
                    </Grid>

                    {/* <Grid xs={12} md={6} >
                        <Card item className='second_box' sx={{ display: 'flex', alignItems: 'center', p: 3}}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography>More Info</Typography>
                                <Divider/>
                            </Box>
                        </Card>
                    </Grid> */}
                </Grid>

                {/* <Grid container sx={{p:3}}>
                    <Grid xs={12}>
                    <Card >
                        <BalanceTab address={accountAddress}/>
                    </Card>
                    </Grid>
                </Grid> */}
            </Box>
        </Card>
    </>
  )
}

export default SearchBalance