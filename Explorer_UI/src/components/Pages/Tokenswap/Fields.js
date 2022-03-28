import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
//import Choices from './Choices';


export default function Fields() {
  return (
    <Box
      component="form"
      sx={{
      }}
      noValidate
      autoComplete="off"
    >
      <TextField id="outlined-basic" label="Enter amount" variant="outlined" type="number" pattern="[0-9]*" >
      
      </TextField>
  

      
     
    </Box>
  );
}
