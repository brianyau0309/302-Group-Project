'use stritc'
const express = require('express');
const fs = require('fs')
const DBConn = require('./DBConn').DBConn
const DBInfo = JSON.parse(fs.readFileSync("ShareTea.json"))

const app = express()
const db = new DBConn(DBInfo)

app.get('/api/item', (req, res) => {
  console.log(' - GET /api/item')
  db.exe('SELECT * FROM item').then(result => {
    res.status(200).json(result.rows)
  })
})

app.listen(3000, () => {
  console.log(' - ShareTea Nodejs Server: Port 3000')
})