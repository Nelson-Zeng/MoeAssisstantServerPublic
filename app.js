const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const dataManagerRouter = require('./routes/datamanager')
const zjsnrRouter = require('./routes/zjsnr')
const cqhyRouter = require('./routes/cqhy')
const applicationRouter = require('./routes/application')

const app = express()

//设置允许跨域访问该服务.
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    res.header('Access-Control-Allow-Methods', '*')
    res.header('Content-Type', 'application/json;charset=utf-8')
    next()
})

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/zjsnr', zjsnrRouter)
app.use('/cqhy', cqhyRouter)
app.use('/datamanager', dataManagerRouter)
app.use('/application', applicationRouter)

module.exports = app