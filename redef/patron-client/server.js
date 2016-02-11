const express = require('express')
const path = require('path')
const port = process.env.PORT || 8000
const app = express()
var requestProxy = require('express-request-proxy');

app.use(require('connect-livereload')())

app.use(express.static(__dirname + '/public'))

app.all('/services/*', requestProxy({
  url: "http://services:8005/*"
}))

app.get('*', function (request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'index.html'))
})

app.listen(port)
console.log("server started on port " + port)

