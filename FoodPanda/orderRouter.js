const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')
const fs = require('fs')
const DBConn = require('../DBConn').DBConn
const DBInfo = JSON.parse(fs.readFileSync("FoodPanda.json")) 
const db = new DBConn(DBInfo)

const ShareTea = 'http://localhost:3000'

router.get('/:id', async (req,res,next) => {
  let order_id = req.params.id
  const data = await db.execute(`SELECT * FROM orders WHERE order_id = ${order_id}`)
  const orderData = data.rows[0]
  fetch(ShareTea+'/api/order/'+orderData.SHARETEA_ORDER).then(response => {
    if (response.ok) {
      response.json().then(result => {
        orderData['ORDER_ITEMS'] = result.order_item_data
        res.status(200).json(orderData)
      })
    } else {
      res.status(400).json({Error: 'Invalid Order ID'})
    }
  })
})

router.post('/', async (req, res, next) => {
  try {
    const clientData = req.body.clientData
    const client = await db.execute(`SELECT * FROM member WHERE member_id = '${clientData.member_id}'`)
    if (client.rows.length > 0) {
      const orderData = req.body.orderData
      fetch(ShareTea+'/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      }).then(response => {
        if (response.ok) {
          response.json().then(result => {
            console.log(result.order_id)
            fetch(ShareTea+'/api/order/'+result.order_id).then(order => {
              order.json().then(async orders_data => {
                let total = 0
                for (item of orders_data.order_item_data) {
                  total += item.ITEM_PRICE
                  for (remark of item.remarks) {
                    total += remark.REMARK_PRICE
                  }
                }
                let price_rate = await db.execute(`SELECT * FROM price`)
                total *= 1+price_rate.rows[0].PRICE_RATE
                let order_id = await db.execute(`
                  INSERT INTO orders (order_id, member, client_address, order_state, dates, total_price, sharetea_order)
                  VALUES (LPAD(orders_pk.NEXTVAL,8,0), '${clientData.member_id}', '${clientData.address}', 'producing', TO_DATE('${clientData.order_time}','yyyy/mm/dd hh24:mi:ss'), ${Number(total.toFixed(1))}, '${result.order_id}')
                  `, 'orders_pk')
                fetch('http://localhost:3001/api/reload',{method: 'POST'})
                res.status(200).json({order: 'Success', order_id: String(order_id.lastRowid).padStart(8,'0') })
              })
            })
          })
        } else {
          response.json().then(result => { 
            res.status(400).json(result)
          })
        }
      })
    }
  } catch (err) {
    res.status(400).json({ Error: err })
  }
})

router.delete('/:id', async (req,res,next) => {
  let order_id = req.params.id
  const data = await db.execute(`SELECT * FROM orders WHERE order_id = ${order_id}`)
  const orderData = data.rows[0]
  fetch(ShareTea+'/api/order/'+orderData.SHARETEA_ORDER, {method: 'DELETE'}).then(response => {
    response.json().then(async result => {
      if (result.delete_order === 'Success') {
        let deleteResult = await db.execute(`DELETE FROM orders WHERE order_id = ${order_id}`)
        res.status(200).json({delete_order: 'Success'})
      } else {
        res.status(400).json({delete_order: 'Error'})
      }
    })
  })
})

module.exports = router