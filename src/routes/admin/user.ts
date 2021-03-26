import { Router, Request, Response } from 'express'
// import session, { SessionOptions } from 'express-session'
// import SessionFileStore from 'session-file-store'
// import Cookies from 'cookie-parser'
import jsonwebtoken from 'jsonwebtoken'
import { getRequestBody, getDefaultResponseBody } from '@/shared/utils'
import UserModel from '@/models/user'
import User, {
  AddUserRequestOptions,
  DeleteUserRequestOptions,
  Sex,
  AdminRole,
  AppRole,
  UserLoginRequestOptions,
} from '@/admin-types/modules/User'
import { AdminInterfaceUrlMapper } from '@/admin-types/common/Url_Admin'
import { ResponseCodeEnum } from '@/admin-types/common/ResponseCodeEnum'
import { secretKey, tokenExpiresIn } from '@/shared/config'

// todo MD5 password

const router = Router()

/** 注册token配置文件 */
// router.use(jwtAuth)

/** // 如果token过期或者 错误的处理(结尾附 过期和错误的代码区别) */
// router.use((err: any, req: any, res: any, next: any) => {
//   console.log('如果token过期或者')
//   if (err.name === 'UnauthorizedError') {
//     const responseBody = getDefaultResponseBody()
//     Object.assign(responseBody, { code: ResponseCodeEnum.USER_UNAUTHORIZED, message: '非法token' })
//     res.json(responseBody)
//   } else {
//     next()
//   }
// })

/** 中间件 */
router.use((req, res, next) => {
  // responseBody
  console.log('---user 请求来了---', new Date())
  next()
})

// var FileStore = SessionFileStore(session)
// const identityKey = 'testKey'
// router.use(session({
//   name: identityKey,
//   secret: 'haoyong', // 用来对session id相关的cookie进行签名
//   store: new FileStore(), // 本地存储session（文本文件，也可以选择其他store，比如redis的）
//   saveUninitialized: false, // 是否自动保存未初始化的会话，建议false
//   resave: false, // 是否每次都重新保存会话，建议false
//   cookie: {
//     maxAge:  60 * 1000 * 300 // 有效期，单位是毫秒
//   },
// } as SessionOptions))

router.get('/test', (req, res, next) => {
  res.send('get test')
})

/** 登陆 */
router.post(AdminInterfaceUrlMapper.USER_LOGIN, async (req: Request, res: Response, next) => {
  const body = getRequestBody(req) as UserLoginRequestOptions
  const responseBody = getDefaultResponseBody()
  if (!body.userName) {
    Object.assign(responseBody, { code: ResponseCodeEnum.INVALID_PARAMETER, message: '请输入账户名' })
    res.json(responseBody)
  } else if (!body.password) {
    Object.assign(responseBody, { code: ResponseCodeEnum.INVALID_PARAMETER, message: '请输入密码' })
    res.json(responseBody)
  }
  UserModel.findOne({ userName: body.userName }).then((user: any) => {
    if (!user) {
      Object.assign(responseBody, { code: ResponseCodeEnum.INVALID_PARAMETER, message: '用户不存在' })
      res.json(responseBody)
    } else {
      // 用户存在
      if (user.password !== body.password) {
        // 密码错误
        Object.assign(responseBody, { code: ResponseCodeEnum.USER_UNAUTHORIZED, message: '密码错误' } )
        res.json(responseBody)
      } else {
        // 成功

        // 方案1
        /** 把所有用户的登陆信息存储在 sessionMapper 中：{ user1: sessionId1, user2: sessionId2 .... } */
        // const { sessionMapper = {} } = req.session as any
        // const uuid = getUuid()
        // sessionMapper[user.userName] = uuid
        // console.log(`session input => userName:${user.userName}, value:${uuid}`);
        // (req.session as any).sessionMapper = sessionMapper
        /** 更新session完成 */
        // Object.assign(responseBody, { code: ResponseCodeEnum.SUCCESS, message: '登陆成功', data: { user, token: uuid } } )

        // 方案2
        let tokenObject: DecodedTokenObject = {
          userName: ((user as User).userName) as string,
          id: ((user as User).id) as number,
        }
        let token = jsonwebtoken.sign(tokenObject, secretKey, { expiresIn: tokenExpiresIn }) // 超时（s）：2h
        console.log('---> new token, ', token)
        Object.assign(responseBody, { code: ResponseCodeEnum.SUCCESS, message: '登陆成功', data: { user, token } } )

        // 成功返回
        res.json(responseBody)
      }
    }
  })
})

/** 接口：用户添加 */
router.post(AdminInterfaceUrlMapper.USER_ADD, async (req: Request, res: Response, next) => {
  const body = getRequestBody(req) as AddUserRequestOptions
  const responseBody = getDefaultResponseBody()
  // const { cookies: Cookies } = req
  const sess = (req.session as any)
  console.log(sess.sessionMapper)

  const errorMessageMapper = {
    noUserName: 'userName 不能为空',
    userNameOutLength: 'userName 长度不能超过20个字符',
    noPassport: '密码不能为空',
    noPassportConfirm: '验证密码不能为空',
    passportAndPassportConfirmNotEqual: '密码和验证密码不相等',
  }
  // 权限判断
  // ❌错误处理❌
  if (!body.userName) {
    Object.assign(responseBody, { code: ResponseCodeEnum.INVALID_PARAMETER, message: errorMessageMapper.noUserName })
    res.json(responseBody)
  }
  else if (body.userName.length > 20) {
    Object.assign(responseBody, { code: ResponseCodeEnum.INVALID_PARAMETER, message: errorMessageMapper.userNameOutLength })
    res.json(responseBody)
  }
  else if (!body.password) {
    Object.assign(responseBody, { code: ResponseCodeEnum.INVALID_PARAMETER, message: errorMessageMapper.noPassport })
    res.json(responseBody)
  }
  else if (!body.passwordConfirm) {
    Object.assign(responseBody, { code: ResponseCodeEnum.INVALID_PARAMETER, message: errorMessageMapper.noPassportConfirm })
    res.json(responseBody)
  }
  else if (body.passwordConfirm !== body.password) {
    Object.assign(responseBody, { code: ResponseCodeEnum.INVALID_PARAMETER, message: errorMessageMapper.passportAndPassportConfirmNotEqual })
    res.json(responseBody)
  }
  // 正确返回
  else {
    const {
      userName,
      appRole = AppRole.OTHER,
      adminRole = AdminRole.OTHER,
      password,
      phone = '',
      tipQA = '',
      email = '',
      age = 0,
      sex = 0,
      realName = '',
    } = body
    // 取最后一个用户
    const lastUser = await UserModel.find({}).sort({ _id: -1 }).limit(1);
    // 用户id 1000 起步
    let newUserId: number = 1000
    // !! 注意 id采用取最后一个用户id累加方式 所以用户表顺序不可错乱
    console.log('lastUser', lastUser)
    if (lastUser.length && lastUser[0].id) {
      newUserId = lastUser[0].id + 1
    } else {
      newUserId += 1
    }
    const user: User = {
      id: newUserId,
      userName,
      password,
      sex,
      age,
      tipQA,
      email,
      phone,
      realName,
      registerTime: new Date().getTime(),
      updateTime: new Date().getTime(),
      adminRole,
      appRole,
    }
    const userModel = new UserModel(user)
    userModel.save().then(_user => {
      Object.assign(responseBody, { code: ResponseCodeEnum.SUCCESS, message: '添加成功', data: _user })
      res.json(responseBody)
    })
  }
})
/** 接口：用户列表 */
router.get(AdminInterfaceUrlMapper.USER_LIST, (req: Request, res: Response, next) => {
  const responseBody = getDefaultResponseBody()
  UserModel.find({}, '').then(users => {
    Object.assign(responseBody, { code: ResponseCodeEnum.SUCCESS, message: '成功', data: {
      list: users,
      count: users.length
    } })
    res.json(responseBody)
  })
})
/** 接口：用户删除 */
router.post(AdminInterfaceUrlMapper.USER_DELETE, (req,res, next) => {
  const responseBody = getDefaultResponseBody()
  const body = getRequestBody(req) as DeleteUserRequestOptions
  // token 处理
  jsonwebtoken.verify(body.token, secretKey, function(err, decodedTokenObject) {
    console.log('---> verify')
    console.log(err)
    console.log(decodedTokenObject)
    // todo 校验用户token是否真实
  })

  if (!body.id) {
    Object.assign(responseBody, { code: ResponseCodeEnum.INVALID_PARAMETER, message: '请输入待删除用户' })
    res.json(responseBody)
  }
  const userId = Number(body.id)
  UserModel.findOneAndRemove({ id: userId }).then(user => {
    console.log('user', user)
    if (user && (user.id === userId)) {
      Object.assign(responseBody, { code: ResponseCodeEnum.SUCCESS, message: '删除成功', data: user } )
    } else {
      Object.assign(responseBody, { code: ResponseCodeEnum.SERVICE_ERROR, message: '未找到该用户', data: null } )
    }
    res.json(responseBody)
  })
})

export default router