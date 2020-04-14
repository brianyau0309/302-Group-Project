'use stritc'
// Express Setup
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const session = require('express-session')
const app = express()
app.engine('html', require('ejs').renderFile)
app.set('trust proxy', 1) 
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}))
app.use(express.static('static'))
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
const server = require('http').Server(app)
const io = require('socket.io')(server)
// required libary
const fs = require('fs')
const path = require("path")
const DBConn = require('../DBConn').DBConn
const DBInfo = JSON.parse(fs.readFileSync("FoodPanda.json")) 
const db = new DBConn(DBInfo)
const fetch = require('node-fetch')

// Router
const orderRoutes = require('./orderRouter')
app.get('/api/orders/:member', async (req, res, next)=> {
  let member = req.params.member
  const data = await db.execute(`SELECT * FROM orders WHERE member = ${member}`)
  res.status(200).json(data.rows)
})
app.get('/api/orders', async (req, res, next)=> {
  let address = req.query.address, data
  if (address) {
    data = await db.execute(`SELECT * FROM orders WHERE client_address like '%${address}%'`)
  } else {
    data = await db.execute(`SELECT * FROM orders`)
  }
  res.status(200).json(data.rows)
})
app.use('/api/order', orderRoutes)

app.get('/', (req, res, next)=> {
  res.status(200).sendFile(path.resolve('FoodPanda/index.html'))
})

app.get('/adminlogin', (req, res, next)=> {
  res.status(200).sendFile(path.resolve('FoodPanda/admin_login.html'))
})

app.get('/adminpage', (req, res, next)=> {
  res.status(200).sendFile(path.resolve('FoodPanda/adminpage.html'))
})

app.get('/adminchpw', (req, res, next)=> {
  res.status(200).sendFile(path.resolve('FoodPanda/adminchpw.html'))
})

app.get('/staff', async (req, res, next)=> {
  data = await db.execute(`SELECT * FROM orders WHERE staff IS NULL`)
  res.render(path.resolve('FoodPanda/staff.html'),{orders: data.rows})
})

app.get('/logined',async (req, res, next)=> {
  let member_ID = req.session.member_ID
  let item = await fetch('http://localhost:3000/api/item').then(result => result.json().then(items=>items))
  let branch = await fetch('http://localhost:3000/api/branch').then(result => result.json().then(branchs=>branchs))
  console.log(1, branch)
  let remark = item[0].remark
  let ordered_list = await fetch('http://localhost:3001/api/orders/'+member_ID).then(result => result.json().then(order_list=>order_list))
  console.log(2,ordered_list)
  if(req.session.item !== undefined){
    let added_item = req.session.item
    console.log(added_item)
    res.render(path.resolve('FoodPanda/login.html'),{member_ID: member_ID, item: item, ordered_list: ordered_list, added_item: added_item, remark_list: remark, branch: branch})
  }
  else{
    req.session.item = []
    let added_item = req.session.item
    console.log(added_item)
    res.render(path.resolve('FoodPanda/login.html'),{member_ID: member_ID, item: item, ordered_list: ordered_list, added_item: added_item, remark_list: remark, branch: branch})
  }
  
})

app.post('/login',async (req, res, next) => {
  try {
      const member_ID = req.body.member_ID 
      const password = req.body.password
      const member_data = await db.execute(`SELECT * FROM member WHERE member_id = '${member_ID}' and password='${password}'`)
      if (member_data.rows[0]){
        req.session.member_ID = member_ID
        member = JSON.stringify({"member_ID": member_ID})
        res.redirect(`/logined`, 302)
      } else {
        res.status(400).json({'Error': 'Invalid ID or Password'})
      }
  }
  catch (err) {
    res.status(400).json({ Error: err })
  }
})

app.post('/api/adminlogin', async (req, res, next) => {
  staff_id = req.body.staff_id
  password = req.body.password
  console.log(staff_id, password)
  if (staff_id === `1` && password === `1`){ 
  res.redirect(`/adminpage`, 302)}
  else {
    res.status(400).json({'Error' : 'Invalid ID or Password'})}
})

app.post('/api/password', async (req, res, next) => {
  member_id = req.body.member_ID
  old_pass = req.body.OldPassword
  new_pass = req.body.NewPassword
  console.log(member_id, old_pass, new_pass)
  let password = await db.execute(`SELECT password FROM member WHERE member_id = '${member_id}' AND password = '${old_pass}'`)
  console.log(password)
  if (password.rows.length === 1) {
    let result = await db.execute(`UPDATE member SET password = '${new_pass}' WHERE member_id = '${member_id}'`)
    res.status(200).json({'Success': 'Password Changed', 'Result': result})
  } else {
    res.status(400).json({'Error': 'Invalid Password'})
  }
})

app.post('/add_item',async (req, res, next) => {
  try {
    const item = req.body.item
    const size = req.body.size
    const ice = req.body.ice
    const sugar = req.body.sugar
    const other = req.body.other
    let seq = 1
    let remark =[]
    console.log(ice,sugar,other)
    req.session.item.forEach( i => {
      if(i.code === item){
        seq += 1
      }
    })
    if(ice ){
      remark.push(ice)
    }
    if(sugar){
      remark.push(sugar)
    }
    if(other ){
      remark.push(other)
    }
    req.session.item.push({code: item, seq: seq, size: size, remarks: remark})
    res.redirect(`/logined`, 302)
    }
  catch (err) {
    res.status(400).json({ Error: err })
  }
})

app.post('/delete_added_item', async (req, res, next) => {
  try {
    const id = req.body.id
    req.session.item.splice(id,1)
    res.redirect(`/logined`, 302)
  }
  catch(err){
    res.status(400).json({ Error: err })
  }
})

app.post('/ordering', async (req, res,next) => {
  try {
  const order_item=req.session.item
  const distict=req.body.district
  const branch=req.body.branch
  const address=req.body.address
  const member_ID=req.session.member_ID
  const clientData = {
    member_id: member_ID,
    address: address,
    order_time: new Date().toLocaleString().replace('/', '-').replace(',', '') ,
  }
  const orderData = {
    branch_code: branch,
    order_time: new Date().toLocaleString().replace('/', '-').replace(',', '') ,
    order_items: order_item
  }
  console.log(clientData)
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
  req.session.item = []
  res.redirect(`/logined`, 302)
  }
  catch(err){
    res.status(400).json({ Error: err })
  }
})
app.post('/api/reload', (req,res,next) => {
  io.emit('reload')
  console.log('reload')
  res.status(200)
})

//Error Handling
app.use((req, res, next) => {
  const error = new Error('Not found')
  error.status = 404
  next(error)
})
app.use((error, req, res, next) => {
  res.status(error.status || 500)
  res.json({
    error: {
      message: error.message
    }
  })
})

io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on("disconnect", () => {
    console.log("a user go out")
  })
})

server.listen(3001, () => {
  console.log('FoodPanda Nodejs Server: Port 3001')
})
