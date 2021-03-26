import { Request } from 'express'
import { ResponseCodeEnum } from '@/admin-types/common/ResponseCodeEnum'
// import expressJwt from 'express-jwt'
import { secretKey } from '@/shared/config'
import jsonwebtoken, { VerifyErrors } from 'jsonwebtoken'
// import { DecodedTokenObject } from '@/types/common'

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
// export const jwtAuth = (): void => {
//   expressJwt({ secret: secretKey, algorithms: [] }) //.unless({path:['/index/load']})
// }

/**
 * 获取并校验 token 是否合法（存在且未过期）
 * 不对用户变动导致的问题做校验，服务应该在用户删除或致命属性变动时，强制使其token失效
 * @param req 请求头
 * @returns promise
 */
export const getAndVerifyToken = function (req: Request): Promise<{
  code: ResponseCodeEnum;
  message: string;
  data?: DecodedTokenObject | undefined;
}> {
  const token: string = req.headers['authorization'] || ''
  return new Promise((resolve, reject) => {
    if (!token) {
      reject({
        code: ResponseCodeEnum.USER_UNAUTHORIZED,
        message: '用户未认证'
      })
    } else {
      jsonwebtoken.verify(token, secretKey, {}, function(err: (VerifyErrors | null), decoded) {
        if (err) {
          if (err && err.name === 'TokenExpiredError') {
            console.log('jsonwebtoken err.....---- 过期')
            reject({
              code: ResponseCodeEnum.USER_AUTHORIZED_EXPIRED,
              message: '用户认证过期'
            })
          } else {
            console.log('jsonwebtoken err.....---- 无效')
            reject({
              code: ResponseCodeEnum.USER_AUTHORIZED_INVALID,
              message: '无效用户认证'
            })
          }
        } else {
          const data = Object.assign({}, decoded) as DecodedTokenObject
          if (data && data.userName && data.id) {
            resolve({
              code: ResponseCodeEnum.SUCCESS,
              message: `token 有效：${JSON.stringify(data)}`,
              data
            })
          }
        }
      })
    }
  })
}