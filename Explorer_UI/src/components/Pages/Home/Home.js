import React from "react";
import { Grid } from "@mui/material";
import "./home.css";
import Search from "../Search/Search";
import DetailsBox from "../../DetailsBox/DetailsBox";
import Blocks from '../Table/Blocks';
import Transactions from '../Table/Transactions'
import Footer from "../../Footer/Footer";

export default function Home() {



  return <>
   <div className="home_container" style={{background:"black",height:"40vh"}}>
      <Grid container sx={{overflow:"hidden"}} >
        <Grid md={12} item xs={12}>
          <Search />
        </Grid>
      </Grid>

     

      <Grid container sx={{overflow:"hidden"}}>
        <Grid md={12} item sm={12} xs={12}>
            <DetailsBox/>
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{overflow:"hidden",p:2}}>
        <Grid md={6} item sm={12} sx={{ p: 2}} className="blocks_mobile">
        
        {/* <MobileView>
          <h1>This is rendered only on mobile</h1>
        </MobileView>

        <BrowserView>
          <h1>This is rendered only in browser</h1>
        </BrowserView> */}

          <Blocks/>
        </Grid>
        <Grid md={6} item sm={12} sx={{ p: 2 }} className="transactions_mobile">
          <Transactions />
        </Grid>
      </Grid>
      <Footer/>
    </div>
  </>;
}
