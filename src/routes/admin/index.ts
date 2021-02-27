import { Router } from 'express'
import { getRequestBody, defaultResponseBody } from '@/shared/utils'
import UserModel from '@/models/user'
import User, { AddUserRequestOptions, DeleteUserRequestOptions, Sex, AdminRole, AppRole } from '@/admin-types/modules/User'
import { AdminInterfaceUrlMapper } from '@/admin-types/common/Url_Admin'
import { ResponseCodeEnum } from '@/admin-types/common/ResponseCodeEnum'

const router = Router()

const responseBody = defaultResponseBody

/** 中间件 */
router.use((req, res, next) => {
  // responseBody
  next()
})

router.get('/test', (req, res, next) => {
  res.send('get test')
})

/** 接口：用户添加 */
router.post(AdminInterfaceUrlMapper.USER_ADD, async (req,res, next) => {
  const body = getRequestBody(req) as AddUserRequestOptions
  const errorMessageMapper = {
    noUserName: 'userName 不能为空',
    userNameOutLength: 'userName 长度不能超过20个字符',
    noPassport: '密码不能为空',
    noPassportConfirm: '验证密码不能为空',
    passportAndPassportConfirmNotEqual: '密码和验证密码不相等',
  }
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
      realName = '',
    } = body
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
      sex: Sex.UNKNOW,
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
router.get(AdminInterfaceUrlMapper.USER_LIST, (req,res, next) => {
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
  const body = getRequestBody(req) as DeleteUserRequestOptions
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