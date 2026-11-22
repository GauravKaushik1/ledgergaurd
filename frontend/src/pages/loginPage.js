import React from 'react'

function loginPage() {
  const [formData, setFormData] = useState({email:''})
  
    const handleChange=(e)=>
    {
      setFormData({
        ...formData,
      [e.target.name] : e.target.value  
      })
      
    }
    return (
    <>
    <input type="email" placeholder='Enter email' name='email' value={formData.email} onChange={handleChange} />
    <button type="submit" onSubmit={handleSubmit} onClick={handleSubmit}>Submit</button>
    </>
  )
}

export default loginPage