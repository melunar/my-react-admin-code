import { Router } from 'express'
const router = Router()

router.get('/test', (req, res, next) => {
  res.send('get test')
})

export default router