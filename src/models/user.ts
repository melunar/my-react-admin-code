import mongoose, { Schema } from 'mongoose'
import User from '@/admin-types/modules/User'

const userSchema: Schema = new mongoose.Schema({
  id: Number, // 用户ID
  userName: String, // 用户昵称
  realName: String, // 真实姓名
  sex: Number, // 性别
  age: Number,
  password: String,
  tipQA: String,
  email: String,
  phone: String,
  lastLogin: Number,
  registerTime: Number,
  updateTime: Number,
  adminRole: Number,
  appRole: Number,
  token1: String,
  token2: String,
  token3: String,
})

export default mongoose.model('user', userSchema)