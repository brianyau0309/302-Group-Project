const express = require('express')
const router = express.Router()
const Order = require('./Order')
const order = new Order


router.get('/:id', (req, res, next) => {
  // response Order Information according to ID
  let order_id = req.params.id
  ,output 
  order.get_order(order_id).then(orders_data => {
    output=orders_data
    order.get_item_code(order_id).then(order_item_data => {
      output["order_item_data"]=(order_item_data)
      order_item_data.forEach(item =>{
        console.log(item.ITEM_CODE,order_id,item.ITEM_SEQ)
        order.get_remark(item.ITEM_CODE,order_id,item.ITEM_SEQ).then( remarks =>{
          item.remarks=remarks
          res.status(200).json(output)
        })
      })
    })
  })
})

router.post('/', (req, res, next) => {
  // Validate Data => Insert Into Database => Response
  let data
  try {
    data = {
      "branch_code": req.body.orderData.branch_code,
      "order_time": req.body.orderData.order_time,
      "order_items": req.body.orderData.order_items
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
            order.createItem(order_id,item.code,item.seq,price).then(() => {
              item.remarks.forEach(remark => {
                order.createRemark(order_id,item.code,item.seq,remark)
              })
            })
          })
        })
        // Response Success Message
        res.status(200).json({ order: 'Success', order_id: order_id })
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
})

module.exports = router