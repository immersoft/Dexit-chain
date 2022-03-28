import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
//import  $ from 'jquery'; 

export default function Selects() {
  const [currency, setCurrency] = React.useState('');

  const handleChange = (event) => {
    setCurrency(event.target.value);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl sx={{width: 100}}>
        <InputLabel id="demo-simple-select-label">currency</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={currency}
          label="currency"
          onChange={handleChange}
        >
          <MenuItem value={10}>ETH</MenuItem>
          <MenuItem value={20}>DXT</MenuItem>
          <MenuItem value={30}>BNB</MenuItem>
        </Select>

      </FormControl>
    </Box>
  );

}

// $('select').change(function() {
//   $('select option').prop('disabled', false);
//   var index = $(this).find('option:selected').index();
//   $('select').not(this).find('option:lt(' + index + ')').prop('disabled', true);
// })