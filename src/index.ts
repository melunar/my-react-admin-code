import 'module-alias/register'
import express, { Request, Response, Application } from 'express'
import minimist from 'minimist'
import mongoose, { ConnectOptions } from 'mongoose'
import bodyparser, { OptionsUrlencoded } from 'body-parser'
import { applicationStartMessage, mongodbLinkPath, routerDomain } from './shared/config'
// import { applicationStartMessage, mongodbLinkPath, routerDomain } from '@/shared/config'
// import User from "./admin-types/modules/User"

// const responseBody: ResponseCodeEnum = 200
// const user: User = {
//   userName: '100',
// }
// console.log(responseBody)
/** app 创建 */
const app: Application = express()
app.get('/', (req: Request, res: Response) => {
  res.send('my admin server')
})

/** bodyParse设置 给request参数添加body属性 获取请求参数 response参数添加json方法相应请求
兼容数据格式:application/json类型接口 */
app.use(bodyparser.urlencoded({ extended: false } as OptionsUrlencoded))
app.use(bodyparser.json())

/** 路由装载 */
// app.use(routerDomain.admin)

/** 生产环境端口 */
const productionPort: number = 3030
const args = minimist(process.argv.slice(2))
const { port: devPort } = args
const port: number = devPort || productionPort // 端口号
process.argv.forEach((val, index) => {
  console.log(`${index}: ${val}`)
})

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