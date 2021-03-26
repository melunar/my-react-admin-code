import mongoose, { Schema } from 'mongoose'

const jenkinsApplicationSchema: Schema = new mongoose.Schema({
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

export default mongoose.model('jenkinsApplication', jenkinsApplicationSchema)