const fs = require('fs')
const DBConn = require('../DBConn').DBConn
const DBInfo = JSON.parse(fs.readFileSync("ShareTea.json")) 
const db = new DBConn(DBInfo)

class Order {
  get_order(id){
    return new Promise((resolve, reject) => {
      let get_by_id = `SELECT * FROM orders WHERE order_ID='${id}'`
      db.execute(get_by_id).then(result => {
        resolve(result.rows[0])
      }).catch(err => {
        reject(err)
      })
    })
  }
  get_item_code(order_id){
    return new Promise((resolve, reject) => {
      let get_item_code = `SELECT a.order_ID, a.item_code, b.item_description, a.item_seq, a.item_price, a.item_size FROM ORDER_ITEM a, ITEM b WHERE a.item_code=b.item_code and a.order_ID='${order_id}'`
      db.execute(get_item_code).then(result => {
        resolve(result.rows)
      }).catch(err => {
        reject(err)
      })
    })
  }
  get_remark(item_code, orderID, item_seq){
    return new Promise((resolve, reject) => {
      let get_item_remark = `SELECT a.order_ID, a.item_code, a.item_seq, b.remark_price, b.remark_description FROM order_remark a, item_remark b WHERE a.item_remark=b.remark_ID and a.order_ID='${orderID}' and a.item_code='${item_code}' and a.item_seq=${item_seq}`
      db.execute(get_item_remark).then(result => {
        resolve(result.rows)
      }).catch(err => {
        reject(err)
      })
    })
  }
  create(branch_code, order_time) {
    return new Promise((resolve, reject) => {
      let create = `INSERT INTO orders VALUES (LPAD(orders_pk.NEXTVAL, 8, 0), '${branch_code}', TO_DATE('${order_time}','yyyy/mm/dd hh24:mi:ss'))`
      db.execute(create, 'orders_pk').then(result => {
        resolve(result.lastRowid)
      }).catch(err => {
        reject(err)
      })
    })
  }
  createItem(order_id, item_code, item_seq, price) {
    return new Promise(async (resolve, reject) => {
      let createItem = `INSERT INTO order_item VALUES (LPAD('${order_id}', 8, 0), '${item_code}', ${item_seq}, ${price})`
      db.execute(createItem).then(() => {
        resolve('success')
      }).catch(err => {
        reject(err)
      })
    })
  }
  createRemark(order_id, item_code, item_seq, item_remark) {
    return new Promise(async (resolve, reject) => {
      let createItemRemark = `INSERT INTO order_remark VALUES (LPAD('${order_id}', 8, 0), '${item_code}', ${item_seq}, '${item_remark}')`
      db.execute(createItemRemark).then(() => {
        resolve('success')
      }).catch(err => {
        reject(err)
      })
    })
  }
  checkPrice(item_code, item_size) {
    return new Promise(async (resolve, reject) => {
      let checkPrice = `SELECT ${item_size}_PRICE PRICE FROM item WHERE item_code = ${item_code}`
      db.execute(checkPrice).then(result => {
        resolve(result.rows[0].PRICE)
      }).catch(err => {
        reject(err)
      })
    })
  }
}

module.exports = Order