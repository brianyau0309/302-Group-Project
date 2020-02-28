'use stritc'
const express = require('express')
const fs = require('fs')
const fetch = require('node-fetch')
const body_parser = require('body-parser')
const DBConn = require('./DBConn').DBConn
const DBInfo = JSON.parse(fs.readFileSync("FoodPanda.json"))

const app = express()
app.use(body_parser.json())
const db = new DBConn(DBInfo)
const log = `\x1b[32m[Log][${new Date().toLocaleString()}] - \x1b[33m`
const endlog = '\x1b[0m'
const ShareTea = 'http://localhost:3000'

app.all('*', (req, res, next) => {
  let ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress
  if (ip.includes('::ffff:')) {ip = ip.replace('::ffff:', '')}

  console.log(log + `${ip} ${req.method} ${req.url}` + endlog)
  next()
})

app.post('/api/order', (req, res) => {
  try {
    const data = req.body
    fetch(ShareTea+'/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(response => {
      if (response.ok) {
        response.json().then(result => {
          res.status(200).json(result)
        })
      } else {
        res.status(400).json({ Error: response })
      }
    })
  } catch (err) {
    res.status(400).json({ Error: err })
  }
})

app.listen(3001, () => {
  console.log(log + 'FoodPanda Nodejs Server: Port 3001' + endlog)
  db.execute('SELECT * FROM v$version').then(result => console.log(log+result.rows[0].BANNER+endlog))
})
