import { Router, Request, Response } from 'express'
import { getRequestBody, getDefaultResponseBody, defaultResponseBody, getAndVerifyToken } from '@/shared/utils'
import JenkinsApplicationModel from '@/models/jenkins_application'
import { JA } from '@/admin-types/modules/JenkinsApplication'
import { JA_PROTOCOL } from '@/admin-types/modules/JenkinsApplication.proto'
import { ResponseCodeEnum } from '@/admin-types/common/ResponseCodeEnum'

const router = Router()

/** 接口 */
const { JA_ADD, JA_RECEIVE, JA_SUCCESS } = JA_PROTOCOL

/** 中间件 */
router.use(async (_req: Request, _res: Response, next) => {
  console.log('---ja 请求来了---', new Date(), _req.url)
  // ja 模块接口全部需要 token
  const res = await getAndVerifyToken(_req).catch((res: {
    code: ResponseCodeEnum;
    message: string;
  }) => {
    console.log('收到===reject')
    console.log(JSON.stringify(res))
    _res.json(Object.assign(res, {}))
  })
  if (res && res.code === ResponseCodeEnum.SUCCESS) {
    console.log('收到===resolve')
    console.log(JSON.stringify(res))
    next()
  }
})

router.get('/ja/test', (req, res, next) => {
  res.send('test: /ja/test')
})

/** 接口：用户添加 */
router.post(JA_ADD.url, async (req: Request, res: Response, next) => {
  const body = getRequestBody(req) as JA.UploadJAApplication
  const responseBody = Object.assign({}, defaultResponseBody)
  // 权限判断
  // ❌错误处理❌
  if (!body.projectName) {
    Object.assign(responseBody, { code: ResponseCodeEnum.INVALID_PARAMETER, message: '项目名称不能为空' })
    res.json(responseBody)
  }
  else if (body.projectName.length > 20) {
    Object.assign(responseBody, { code: ResponseCodeEnum.INVALID_PARAMETER, message: '项目名称最长20个字符' })
    res.json(responseBody)
  }
  else if (!body.description) {
    Object.assign(responseBody, { code: ResponseCodeEnum.INVALID_PARAMETER, message: '项目描述不能为空' })
    res.json(responseBody)
  }
  else if (!body.repositoryURL) {
    Object.assign(responseBody, { code: ResponseCodeEnum.INVALID_PARAMETER, message: '项目地址不能为空' })
    res.json(responseBody)
  }
  else if (!body.devDeployPath) {
    Object.assign(responseBody, { code: ResponseCodeEnum.INVALID_PARAMETER, message: '项目dev部署地址不能为空' })
    res.json(responseBody)
  }
  else if (!body.masterDeployPath) {
    Object.assign(responseBody, { code: ResponseCodeEnum.INVALID_PARAMETER, message: '项目IDC部署地址不能为空' })
    res.json(responseBody)
  }
  // 正确返回
  else {
    const {
      projectName,
      orgName,
      priority,
      description,
      repositoryURL,
      devDeployPath,
      masterDeployPath,
    } = body

    const ja: JA.JenkinsApplication = {
      projectName,
      orgName,
      applyTime: new Date().getTime(),
      status: JA.JAStatus.APPLYING,
      priority,
      description,
      repositoryURL,
      devDeployPath,
      masterDeployPath,
    }
    const jaModel = new JenkinsApplicationModel(ja)
    jaModel.save().then(ja => {
      Object.assign(responseBody, { code: ResponseCodeEnum.SUCCESS, message: '添加成功', data: ja })
      res.json(responseBody)
    })
  }
})
/** 接口：用户列表 */
// router.get(AdminInterfaceUrlMapper.USER_LIST, (req: Request, res: Response, next) => {
//   const responseBody = getDefaultResponseBody()
//   UserModel.find({}, '').then(users => {
//     Object.assign(responseBody, { code: ResponseCodeEnum.SUCCESS, message: '成功', data: {
//       list: users,
//       count: users.length
//     } })
//     res.json(responseBody)
//   })
// })

export default router