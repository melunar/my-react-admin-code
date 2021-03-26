import { Router, Request, Response } from 'express'
import { getRequestBody, getDefaultResponseBody, defaultResponseBody, getAndVerifyToken } from '@/shared/utils'
import JenkinsApplicationModel from '@/models/jenkins_application'
import { JA } from '@/admin-types/modules/JenkinsApplication'
import { AdminRole } from '@/admin-types/modules/User'
import { JA_PROTOCOL, JA_PROTOCOL_SCHEMA } from '@/admin-types/modules/JenkinsApplication.proto'
import { ResponseCodeEnum } from '@/admin-types/common/ResponseCodeEnum'

const router = Router()

/** 接口 */
const { JA_ADD, JA_SEARCH, JA_RECEIVE, JA_SUCCESS } = JA_PROTOCOL

/** 中间件 */
router.use(async (_req: Request, _res: Response, next) => {
  console.log('---ja 请求来了---', new Date(), _req.url)
  // ja 模块接口全部需要 token
  const tokenRes = await getAndVerifyToken(_req).catch((errRes: {
    code: ResponseCodeEnum;
    message: string;
  }) => {
    // console.log('收到===reject')
    console.log(JSON.stringify(errRes))
    _res.json(Object.assign(errRes, {}))
  })
  if (tokenRes && tokenRes.code === ResponseCodeEnum.SUCCESS) {
    (_req as unknown as RequestWithTokenObject).tokenObject = (tokenRes.data as DecodedTokenObject)
    next()
  }
})

router.get('/ja/test', (req, res, next) => {
  // todo
  res.send('test: /ja/test')
})

/** 接口：项目添加 */
router.post(JA_ADD.url, async (req: Request, res: Response, next) => {
  const body = getRequestBody(req) as JA.UploadJAApplication
  const { tokenObject: { id: userId, userName } } = req as unknown as RequestWithTokenObject
  console.log('userId', userId, userName)
  const responseBody = Object.assign({}, defaultResponseBody)
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
      userId
    }
    const jaModel = new JenkinsApplicationModel(ja)
    jaModel.save().then(ja => {
      Object.assign(responseBody, { code: ResponseCodeEnum.SUCCESS, message: '添加成功', data: ja })
      res.json(responseBody)
    })
  }
})

/** 接口：项目列表 */
router.get(JA_SEARCH.url, (req: Request, res: Response, next) => {
  const params = (req.query) as JA_PROTOCOL_SCHEMA.JA_SEARCH.REQUEST
  const { projectName = '', status: projectStatus = 0 } = params
  const responseBody = getDefaultResponseBody()
  const { tokenObject: { id: userId, userName, adminRole } } = req as unknown as RequestWithTokenObject
  console.log('userId', userId, userName)
  // projectName：利用正则语法 实现模糊查询
  const findParam: any = { projectName: RegExp(projectName) }
  if (adminRole !== AdminRole.ADMIN) { // 管理员查看所有数据 非管理员只查询对应userId数据
    findParam.userId = userId
  }
  if (projectStatus) findParam.status = projectStatus
  console.log('findParam', findParam)
  JenkinsApplicationModel.find(findParam, '').sort({ _id: -1 /* _id=>时间倒叙 */}).then(ja_list => {
    console.log('ja_list', ja_list)
    Object.assign(responseBody, { code: ResponseCodeEnum.SUCCESS, message: '成功', data: {
      list: ja_list,
      count: ja_list.length
    } })
    res.json(responseBody)
  })
})

/** 接口：接受申请 */
router.post(JA_RECEIVE.url, (req: Request, res: Response, next) => {
  const params = (getRequestBody(req)) as JA_PROTOCOL_SCHEMA.JA_RECEIVE.REQUEST
  const responseBody = getDefaultResponseBody()
  // 参数校验
  if (!params._id) {
    Object.assign(responseBody, { code: ResponseCodeEnum.INVALID_PARAMETER, message: '项目ID不能为空' })
    return res.json(responseBody)
  }
  const { tokenObject: { id: userId, adminRole } } = req as unknown as RequestWithTokenObject
  if (adminRole !== AdminRole.ADMIN) {
    Object.assign(responseBody, { code: ResponseCodeEnum.USER_NOT_ALLOWED, message: '仅管理员可操作' })
    return res.json(responseBody)
  }
  // 修改状态为接受(状态校验做的比较粗糙，最后一步谨慎一点 这里算了)
  JenkinsApplicationModel.updateOne({ _id: params._id }, { status: JA.JAStatus.RECEIVE }).then(ja => {
    Object.assign(responseBody, { code: ResponseCodeEnum.SUCCESS, message: '成功', data: ja})
    res.json(responseBody)
  }).catch(() => {
    Object.assign(responseBody, { code: ResponseCodeEnum.SERVICE_ERROR, message: '操作失败', data: null })
    res.json(responseBody)
  })
})

/** 接口：成功 */
router.post(JA_SUCCESS.url, (req: Request, res: Response, next) => {
  const params = (getRequestBody(req)) as JA_PROTOCOL_SCHEMA.JA_SUCCESS.REQUEST
  const responseBody = getDefaultResponseBody()
  // 参数校验
  if (!params._id) {
    Object.assign(responseBody, { code: ResponseCodeEnum.INVALID_PARAMETER, message: '项目ID不能为空' })
    return res.json(responseBody)
  }
  const { tokenObject: { id: userId, adminRole } } = req as unknown as RequestWithTokenObject
  if (adminRole !== AdminRole.ADMIN) {
    Object.assign(responseBody, { code: ResponseCodeEnum.USER_NOT_ALLOWED, message: '仅管理员可操作' })
    return res.json(responseBody)
  }
  // 找到id
  JenkinsApplicationModel.findOne({ _id: params._id }, '').then((ja) => {
    if (ja && (ja as unknown as JA.JenkinsApplication).status !== JA.JAStatus.RECEIVE) {
      Object.assign(responseBody, { code: ResponseCodeEnum.USER_NOT_ALLOWED, message: '仅接受状态的项目允许置为成功', data: null })
      res.json(responseBody)
      return
    }
    // 修改状态为成功
    JenkinsApplicationModel.updateOne({ _id: params._id }, { status: JA.JAStatus.SUCCESS }).then(ja => {
      Object.assign(responseBody, { code: ResponseCodeEnum.SUCCESS, message: '成功', data: ja})
      res.json(responseBody)
    }).catch(() => {
      Object.assign(responseBody, { code: ResponseCodeEnum.SERVICE_ERROR, message: '修改操作失败', data: null })
      res.json(responseBody)
    })
    Object.assign(responseBody, { code: ResponseCodeEnum.SUCCESS, message: '成功', data: ja})
    res.json(responseBody)
  }).catch(() => {
    Object.assign(responseBody, { code: ResponseCodeEnum.SERVICE_ERROR, message: '检索_id失败', data: null })
    res.json(responseBody)
  })
})

export default router