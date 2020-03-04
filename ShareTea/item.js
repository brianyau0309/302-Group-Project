const express = require('express')
const router = express.Router()
const fs = require('fs')
const DBConn = require('../DBConn').DBConn
const DBInfo = JSON.parse(fs.readFileSync("ShareTea.json"))
const db = new DBConn(DBInfo)

router.get('/', (req, res, next) => {
  db.execute(`SELECT * FROM item`).then(result => {
    res.status(200).json(result.rows)
  })
})

module.exports = router