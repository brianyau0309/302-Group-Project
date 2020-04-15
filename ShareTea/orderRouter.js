const express = require('express')
const router = express.Router()
const Order = require('./Order')
const order = new Order
const fetch = require('node-fetch')


router.get('/:id', async (req, res, next) => {
  // response Order Information according to ID
  try {
    let order_id = req.params.id, items, output
    output = await order.get_order(order_id)
    items = await order.get_item_code(order_id)
    for (let item of items) {
      let remarks = await order.get_remark(item.ITEM_CODE,order_id,item.ITEM_SEQ)
      item['remarks'] = await remarks
    }
    output["order_item_data"] = await items
    res.status(200).json(output)
  } catch {
    res.status(400).json({Error: 'Invalid Order ID'})
  }
})

router.post('/', (req, res, next) => {
  // Validate Data => Insert Into Database => Response
  let data
  try {
    data = {
      "branch_code": req.body.branch_code,
      "order_time": req.body.order_time,
      "order_items": req.body.order_items
    }
    // Validate Data
    if (
        data.branch_code.length === 4
        && new Date(data.order_time) > new Date(new Date().setHours(0,0,0,0))
        && Array.isArray(data.order_items)
        && data.order_items.length > 0
      ) {
      // Create order
      order.create(data.branch_code, data.order_time).then(order_id => {
        data.order_items.forEach(item => {
          order.checkPrice(item.code,item.size).then(price => {
            order.createItem(order_id,item.code,item.seq,price,item.size.charAt(0)).then(() => {
              item.remarks.forEach(remark => {
                order.createRemark(order_id,item.code,item.seq,remark)
              })
            })
          })
        })
        // Response Success Message
        fetch('http://localhost:3000/api/reload',{method: 'POST'})
        res.status(200).json({ order: 'Success', order_id: String(order_id).padStart(8,'0') })
      })
    } else {
      res.status(400).json({ Error: "Invalid Data" })
    }
  } catch(err) {
    res.status(400).json({ Error: err })
  }
})

router.delete('/:id', (req, res, next) => {
  // delete order according to ID
  let order_id = req.params.id
  order.deleteOrder(order_id).then(result => {
    console.log('Delete Order: '+order_id)
    fetch('http://localhost:3000/api/reload',{method: 'POST'})
    res.status(200).json({ delete_order: 'Success' })
  }).catch(err => {
    res.status(400).json({ Error: err })
  })
})

module.exports = router