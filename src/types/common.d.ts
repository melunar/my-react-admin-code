// import { Request } from 'express'

/** token 解码数据结构 */
interface DecodedTokenObject {
  userName: string;
  id: number;
  adminRole: number;
}

/** 带token解码数据的请求 */
interface RequestWithTokenObject extends Request {
  tokenObject: DecodedTokenObject
}