import React, { useState } from 'react'

function registrationPage() {

  const [formData, setFormData] = useState({email:''})

  const handleChange=(e)=>
  {
    setFormData({
      ...formData,
    [e.target.name] : e.target.value  
    })
    
  }

  const handleSubmit=()=>{

    
  }
  return (
    <>
    <input type="email" placeholder='Enter email' name='email' value={formData.email} onChange={handleChange} />
    <button type="submit" onSubmit={handleSubmit} onClick={handleSubmit}>Submit</button>
    </>
  )
}

export default registrationPage