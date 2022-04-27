import { Button, Card, TextareaAutosize, TextField } from '@mui/material'
import { Box } from '@mui/system'
import React,{useState} from 'react'

const TokenDeploy = () => {
    const[textInput,setTextInput]=useState('')
  return (
    <>
    <Card sx={{boxShadow:"none !important"}}>
        <Box sx={{flexGrow:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <TextField
          id="outlined-multiline-static"
          multiline
          rows={22}
          fullWidth
          sx={{width:1000}}
          value={textInput}
          onChange={(e)=>setTextInput(e.target.value)}
        />
        </Box>

        <div style={{display:"flex",justifyContent:"center",marginTop:"1rem"}}>
            <Button variant="contained" size='large'>Compile</Button>
        </div>
    </Card>
    </>
  )
}

export default TokenDeploy