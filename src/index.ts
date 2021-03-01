import 'module-alias/register' // !!打包之前 注释这行
import express, { Request, Response, Application } from 'express'
import cors from 'express-cors'
import minimist from 'minimist'
import mongoose, { ConnectOptions } from 'mongoose'
import bodyparser, { OptionsUrlencoded } from 'body-parser'
import { applicationStartMessage, mongodbLinkPath, routerDomain } from '@/shared/config'
import adminRoute from '@/routes/admin'

// import path from 'path'
// import moduleAlias from 'module-alias'
// moduleAlias.addAlias('@', path.resolve(__dirname, 'build'))

/** app 创建 */
const app: Application = express()
app.get('/', (req: Request, res: Response) => {
  res.send('my admin server')
})

/** 跨域允许 */
// app.all('*', function(req, res, next) {
//   console.log('111')
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
//   res.header("X-Powered-By",' 3.2.1')
//   res.header("Content-Type", "application/json;charset=utf-8");
//   next();
// });
app.use(cors({
  allowedOrigins: [
    'localhost:3000', 'my-admin.lalapkp.cn'
  ]
}))

/** bodyParse设置 给request参数添加body属性 获取请求参数 response参数添加json方法相应请求
兼容数据格式:application/json类型接口 */
app.use(bodyparser.urlencoded({ extended: false } as OptionsUrlencoded))
app.use(bodyparser.json())

/** 路由装载 */
app.use(routerDomain.admin, adminRoute)

/** 生产环境端口 3030, 开发环境 3031 */
const productionPort: number = 3030
const args = minimist(process.argv.slice(2))
const { env } = args
const isDev: boolean = env === 'dev'
// if (isDev) {
//   require('module-alias/register')
// }
const port: number = isDev ? 3031 : productionPort // 端口号
// process.argv.forEach((val, index) => {
//   console.log(`${index}: ${val}`)
// })

/** 数据库连接 应用启动 */
const mOpts:ConnectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}
mongoose.connect(mongodbLinkPath, mOpts)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'mongodb connection error:'))
db.once('open', function() {
  console.log("mongo链接OK")

  app.listen(port, ()=> {
    console.log(applicationStartMessage)
    console.log(`Started at port ${port}`)
  })
})