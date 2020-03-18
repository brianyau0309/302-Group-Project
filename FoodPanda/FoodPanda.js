'use stritc'
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const fs = require('fs')
const DBConn = require('../DBConn').DBConn
const DBInfo = JSON.parse(fs.readFileSync("FoodPanda.json")) 
const db = new DBConn(DBInfo)

// Express Setup
const app = express()
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// Router
const orderRoutes = require('./orderRouter')
app.get('/api/orders/:member', async (req, res, next)=> {
  let member = req.params.member
  const data = await db.execute(`SELECT * FROM orders WHERE member = ${member}`)
  res.status(200).json(data.rows)
})
app.use('/api/order', orderRoutes)

//Error Handling
app.use((req, res, next) => {
  const error = new Error('Not found')
  error.status = 404
  next(error)
})
app.use((error, req, res, next) => {
  res.status(error.status || 500)
  res.json({
    error: {
      message: error.message
    }
  })
})

app.listen(3001, () => {
  console.log('FoodPanda Nodejs Server: Port 3001')
})
