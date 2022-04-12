import React from 'react'
import { useLocation } from 'react-router-dom'

const SearchBalance = () => {
    const location=useLocation()
    const getDetails=location.state.balance
    console.log(getDetails,"getDetails")
  return (
    <div>SearchBalance</div>
  )
}

export default SearchBalance