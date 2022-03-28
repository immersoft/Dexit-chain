import React from 'react'

const ValidaINputFunctional = () => {
    const[numberInput,setNumberInput]=React.useState(0)
  return (
    <div>
        <input type="number" value={numberInput} onChange={(e)=>setNumberInput(e.target.value)}/>
    </div>
  )
}

export default ValidaINputFunctional