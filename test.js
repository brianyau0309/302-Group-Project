// 'node test.js' to run this test file
const fetch = require('node-fetch')
const sampleData = {
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
}

const test = (orderData) => {
  fetch('http://localhost:3001/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderData })
  }).then(res => {
    if (res.ok) {
      res.json().then(result => {
        console.log(result)
      })
    }
  })
}

test(sampleData)