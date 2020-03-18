// 'node test.js' to run this test file
const fetch = require('node-fetch')
const clientData = {
  member_id: '00000001',
  address: 'Some where in Kowloon',
  order_time: new Date().toLocaleString().replace('/', '-').replace(',', '') ,
}
const sampleData = [
  {
    branch_code: "B001",
    order_time: new Date().toLocaleString().replace('/', '-').replace(',', '') ,
    order_items: [
      {
        code: "0001",
        seq: 1,
        size: "LARGE",
        remarks: ["02", "05"]
      },
      {
        code: "0001",
        seq: 2,
        size: "MIDDLE",
        remarks: ["03"]
      },
      {
        code: "0003",
        seq: 1,
        size: "LARGE",
        remarks: []
      }
    ]
  },
  {
    branch_code: "B0012",
    order_time: new Date().toLocaleString().replace('/', '-').replace(',', '') ,
    order_items: [
      {
        code: "0001",
        seq: 1,
        size: "LARGE",
        remarks: ["02", "05"]
      }
    ]
  },
  {
    branch_code: "B002",
    order_time: new Date().toLocaleString().replace('/', '-').replace(',', '') ,
    order_items: []
  }
]

const test = (orderData, clientData) => {
  fetch('http://localhost:3001/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderData: orderData, clientData: clientData })
  }).then(res => {
    if (res.ok) {
      res.json().then(result => {
        console.log(result)
      })
    } else {
      res.json().then(result => {
        console.log(result)
      })
    }
  })
}

const delete_order = (order_id) => {
  fetch('http://localhost:3001/api/order/'+order_id, {method: 'DELETE'}).then(res => {
    res.json().then(result => {
      console.log('Delete Order: '+order_id)
      console.log(result)
    })
  })
}

const check_order = (order_id) => {
  fetch('http://localhost:3001/api/order/'+order_id).then(res => {
    res.json().then(result => {
      console.log('Check Order id:'+ order_id)
      console.log(result)
    })
  })
}

const list_order = (member_id) => {
  fetch('http://localhost:3001/api/orders/'+member_id).then(res => {
    res.json().then(result => {
      console.log('List out Orders that ordered by: '+ member_id)
      console.log(result)
    })
  })
}

if (process.argv[2] === 'order') {
  // order by sample data 0-2
  test(sampleData[process.argv[3]], clientData)
} else if (process.argv[2] === 'list') { 
  // list out the order record
  list_order(process.argv[3])
} else if (process.argv[2] === 'check') { 
  // check out the order record
  check_order(process.argv[3])
} else if (process.argv[2] === 'delete') {
  // delete by input order id
  delete_order(process.argv[3])
}