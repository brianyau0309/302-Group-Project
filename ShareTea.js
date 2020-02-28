'use stritc'
const express = require('express')
const fs = require('fs')
const fetch = require('node-fetch')
const body_parser = require('body-parser')
const DBConn = require('./DBConn').DBConn
const DBInfo = JSON.parse(fs.readFileSync("ShareTea.json"))

const app = express()
app.use(body_parser.json())
const db = new DBConn(DBInfo)
const log = `\x1b[32m[Log][${new Date().toLocaleString()}] - \x1b[33m`
const endlog = '\x1b[0m'

app.all('*', (req, res, next) => {
  let ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress
  if (ip.includes('::ffff:')) {ip = ip.replace('::ffff:', '')}

  console.log(log + `${ip} ${req.method} ${req.url}` + endlog)
  next()
})

app.get('/api/item', (req, res) => {
  db.execute(`SELECT * FROM item`).then(result => {
    res.status(200).json(result.rows)
  })
})

app.post('/api/order', (req, res) => {
  try {
    const data = req.body.orderData

    let branch_code = data.branch_code, order_time = data.order_time,
    order_items = data.order_items,
    create_order = `INSERT INTO orders VALUES (LPAD(orders_pk.NEXTVAL, 8, 0), '${branch_code}', TO_DATE('${order_time}','yyyy/mm/dd hh24:mi:ss'))`
    console.log(create_order) //.then
    let order_id = '00000001' //for testing

    order_items.forEach(item => { //items loop
      let item_code = item.code, item_seq = item.seq,
      item_size = item.size, item_remarks = item.remarks
      db.execute(`SELECT ${item_size}_PRICE PRICE FROM item WHERE item_code = ${item_code}`).then(result => {
        let create_order_item = `INSERT INTO order_item VALUES ('${order_id}', '${item_code}', ${item_seq}, ${result.rows[0].PRICE})`
        console.log(create_order_item) //.then

        item_remarks.forEach(item_remark => { //remarks loop
          let create_order_remark = `INSERT INTO order_remark VALUES ('${order_id}', '${item_code}', ${item_seq}, '${item_remark}')`
          console.log(create_order_remark)
        })
      })
    })
  } catch(err) {
    res.status(400).json({ Error: err })
  } finally {
    res.status(200).json({ order: "Success" })
  }
})

app.listen(3000, () => {
  console.log(log + 'ShareTea Nodejs Server: Port 3000' + endlog)
  db.execute('SELECT * FROM v$version').then(result => console.log(log+result.rows[0].BANNER+endlog))
})