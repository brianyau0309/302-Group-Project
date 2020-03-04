'use stritc'
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const fs = require('fs')
const DBConn = require('../DBConn').DBConn
const DBInfo = JSON.parse(fs.readFileSync("FoodPanda.json"))
const db = new DBConn(DBInfo)

const orderRoutes = require('./order')

const app = express()

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

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
  db.execute('SELECT * FROM v$version').then(result => console.log(result.rows[0].BANNER))
})
