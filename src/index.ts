import express, { Request, Response, Application } from 'express'
import minimist from 'minimist'
import { applicationStartMessage } from './shared/util'

const app: Application = express()

app.get('/', (req: Request, res: Response) => {
    res.send('Hello Ts Express')
})

/** 生产环境端口 */
const productionPort: number = 3030
const args = minimist(process.argv.slice(2))
const { port: devPort } = args
const port: number = devPort || 3030 // 端口号
console.log('args,', args)
process.argv.forEach((val, index) => {
  console.log(`${index}: ${val}`)
})

// const port: number = process.env

app.listen(port, ()=> {
  console.log(applicationStartMessage)
  console.log(`Started at port ${port}`)
})