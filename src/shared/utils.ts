export const getRequestBody = (req: any): any => {
  const body = req.body
  console.log('req.body ->>>>>>>>>>>>', body)
  return body
}

export const defaultResponseBody = {
  code: 100, // ResponseCodeEnum.RECEIVED,
  message: '请求处理中...',
  data: null
}