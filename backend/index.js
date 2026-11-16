const express = require('express')

const dotenv = require('dotenv')

const userRouter = require('./router/user.Router.js')

const app = express()

dotenv.config()

const port = process.env.PORT || 3000

app.get('/', (req,res) => {
    res.send('Hello World')
})

app.use('/api/users',userRouter)

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})
