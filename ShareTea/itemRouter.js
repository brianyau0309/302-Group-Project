const express = require('express')
const router = express.Router()
const fs = require('fs')
const DBConn = require('../DBConn').DBConn
const DBInfo = JSON.parse(fs.readFileSync("ShareTea.json"))
const db = new DBConn(DBInfo)

router.get('/', (req, res, next) => {
  db.execute(`SELECT * FROM item`).then(async result => {
    for(item of result.rows){
      let remark = await db.execute(`SELECT * FROM item_remark`)
      item['remark']=remark.rows
    }
    res.status(200).json(result.rows)
  })
})

module.exports = router