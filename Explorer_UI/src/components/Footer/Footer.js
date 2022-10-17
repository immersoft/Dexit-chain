import { Grid, Paper, Typography } from "@mui/material";
import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 300,
      sm: 600, 
      md: 900, 
      lg: 1200,
      xl: 1536,
    },
  },
});

const Footer = () => {
  return (
    <>
      <ThemeProvider theme={theme}>
        <Paper
          sx={{
            backgroundColor: "#12161C",
            // minHeight: "20vh",
            color: "white",
            width: "100%",

          }}
        >
          <Grid container>
            <Grid sx={{ p: [3, 3, 10, 15, 15], ml: [null, null, 10, 20, 20] }}>
              <Typography>Company</Typography>
              <hr />
              <Typography>Advertise</Typography>
              <Typography>Contact Us</Typography>
              <Typography>Brans Assets</Typography>
              <Typography>Term Of Service</Typography>
            </Grid>
            <Grid sx={{ p: [3, 3, 10, 15, 15] }}>
              <Typography>Community</Typography>
              <hr />
              <Typography>Knowledge Base</Typography>
              <Typography>Network Status</Typography>
            </Grid>
            <Grid sx={{ p: [3, 3, 10, 15, 15] }}>
              <Typography>Products</Typography>
              <hr />
              <Typography>DeXit finance</Typography>
              {/* <Typography>BlockScan</Typography> */}
              {/* <Typography>PolygonScan</Typography> */}
            </Grid>
          </Grid>
        </Paper>
      </ThemeProvider>
    </>
  );
};

export default Footer;
