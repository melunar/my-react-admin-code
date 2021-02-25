const express = require('express')

// Create a new express application instance
const app = express()

app.get('/', (req, res) => {
  res.send('Hello World!!')
  console.error('????')
})

app.listen(3301, ()=> {
  console.log('Example app listening on port 3301!')
})