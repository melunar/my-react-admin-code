import express, { Request, Response, Application } from 'express'
import minimist from 'minimist'
import mongoose, { ConnectOptions } from 'mongoose'
import { applicationStartMessage, mongodbLinkPath } from './shared/util'

/** app 创建 */
const app: Application = express()
app.get('/', (req: Request, res: Response) => {
  res.send('my admin server')
})

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