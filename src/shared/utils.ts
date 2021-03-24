import { Request } from 'express'
import { ResponseCodeEnum } from '@/admin-types/common/ResponseCodeEnum'
import expressJwt from 'express-jwt'
import { secretKey } from '@/shared/config'

export const getRequestBody = (req: Request): any => {
  const body = req.body
  console.log('req.body ->>>>>>>>>>>>', body)
  return body
}

/** 默认请求返回数据包 */
export const getDefaultResponseBody = () => ({
  code: ResponseCodeEnum.RECEIVED,
  message: '请求处理中...',
  data: null
})

/** 默认请求返回数据包 */
export const defaultResponseBody = {
  code: ResponseCodeEnum.RECEIVED,
  message: '请求处理中...',
  data: null
}

/** 生产唯一uuid */
export const getUuid = function (): string {
  let s = []
  let hexDigits = '0123456789abcdef'
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr(((s as any)[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'
  const _uuid = s.join('')
  return _uuid
}

/** 
 *  md5
 *  let md5 = crypto.createHash('md5');
    return md5.update(pwd).digest('hex');
 */

/** token 验证「中间件」*/
export const jwtAuth = (): void => {
  expressJwt({ secret: secretKey, algorithms: [] }) //.unless({path:['/index/load']})
}