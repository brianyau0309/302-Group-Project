'use stritc'
// Express Setup
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const app = express()
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
const server = require('http').Server(app)
const io = require('socket.io')(server)
// required libary
const path = require("path")
const fs = require('fs')
const DBConn = require('../DBConn').DBConn
const DBInfo = JSON.parse(fs.readFileSync("ShareTea.json"))
const db = new DBConn(DBInfo)

// Router
const orderRoutes = require('./orderRouter')
const itemRoutes = require('./itemRouter')
app.use('/api/item', itemRoutes)
app.use('/api/order', orderRoutes)

app.get('/api/branch', (req, res, next)=> {
  db.execute(`SELECT * FROM branch`).then(async result => {
    res.status(200).json(result.rows)
  })
})

app.get('/', (req, res, next)=> {
  res.status(200).sendFile(path.resolve('ShareTea/index.html'))
})

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

io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on("disconnect", () => {
    console.log("a user go out")
  })
})

server.listen(3000, () => {
  console.log('ShareTea Nodejs Server: Port 3000')
})