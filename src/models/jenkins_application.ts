import mongoose, { Schema } from 'mongoose'

const jenkinsApplicationSchema: Schema = new mongoose.Schema({
    userId: Number, /** 创建人 */
    projectName: String, /** 项目名称 */
    orgName: String, /** 组织名 */
    createSuccessTime: Number, /** 创建成功时间 */
    applyTime: Number, /** 申请、再申请时间  */
    status: Number, /** 状态 */
    priority: Number, /** 加急状态 */
    description: String, /** 描述 */
    applyWriteBackMessage: String, /** 回复信息 */
    token: String, /** token */
    repositoryURL: String, /** 项目地址 */
    devDeployPath: String, /** 部署地址-dev */
    masterDeployPath: String, /** 部署地址-master */
})
const BuildLogSchema: Schema = new mongoose.Schema({
    userId: Number, /** user id */
    userName: String, /** user name */
    projectName: String, /** 项目名 */
    branch: String, /** 分支名 */
    remark: String, /** 备注 */
    dateTime: Number, /** 发起构建日期 */
    status: Number, /** 0 */
})

export const BuildLogModel = mongoose.model('BuildLog', BuildLogSchema)
export default mongoose.model('jenkinsApplication', jenkinsApplicationSchema)