const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')
const fs = require('fs')
const DBConn = require('../DBConn').DBConn
const DBInfo = JSON.parse(fs.readFileSync("FoodPanda.json"))
const db = new DBConn(DBInfo)

const ShareTea = 'http://localhost:3000'

router.post('/', (req, res, next) => {
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

module.exports = router