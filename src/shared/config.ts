/** dev启动端口 */
export const devPort: number = 3030

/** pro启动端口 */
export const proPort: number = 3030

/** 启动信息 */
export const applicationStartMessage: string = '程序启动..'

/** 数据库连接地址 使用admin验证用户 */
export const mongodbLinkPath: string = 'mongodb://root:root121@121.37.158.0:27017/my-admin-test?authSource=admin'

/** token 加密公共部分 */
export const secretKey: string = 'admin-code-token-pub-key'

/** 路由域名 */
export const routerDomain: { [key: string]: {
  user: string;
  jenkinsApplication: string;
} } = {
  admin: {
    user: '/admin/user',
    jenkinsApplication: '/admin/jenkins-application',
  }
}

/** token 有效期 秒 「10小时」*/
export const tokenExpiresIn = 60 * 60 * 10
// export const tokenExpiresIn = 10