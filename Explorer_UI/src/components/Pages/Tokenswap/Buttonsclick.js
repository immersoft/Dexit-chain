import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import SwapVertIcon from '@mui/icons-material/SwapVert';


export default function Buttonsclick() {
  return (
    <Stack direction="row" spacing={3}>
      <Button className = "buttonbox" variant="contained" endIcon={<SwapVertIcon/>}>
        SWAP
      </Button>
      
    </Stack>
  );
}
