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
const sampleData2 = {
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
}
const sampleData3 = {
  branch_code: "B002",
  order_time: new Date().toLocaleString().replace('/', '-').replace(',', '') ,
  order_items: []
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
    } else {
      res.json().then(result => {
        console.log(result)
      })
    }
  })
}

process.argv.forEach((val, index) => {
  if (index === 2) {
    if (val == 1) test(sampleData)
    else if (val == 2) test(sampleData2)
    else if (val == 3) test(sampleData3)
    else console.log('Invalid Test No.')
  }
});