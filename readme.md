
## 项目说明

技术栈和框架：`nodeJs, express, typescript, node-ts`

clone: `https://github.com/melunar/my-react-admin-code.git`

安装依赖：`yarn` or `npm i`

开发环境启动：`npm run dev`

tsc打包: `npm run build`, 生成的js项目在`build`文件夹内

最终打包：todo

部署：todo

#### 模块别名

> 使用`module-alias`依赖的 `package.json` => `_moduleAliases`配置，结合`tsconfig.json`的`baseUrl + paths`属性配置

## 注意事项

> 开发环境： ts-node 使用低于v7版本以内的，v7版本之后启动项目对于tsconfig.json文件路径指定一直有问题，导致一些类型检测失败

> tsc build，推荐使用 npm run build 命令，以此来使用local tsc，开发环境的mac 使用的nvm 托管node 安装的全局tsc 版本有问题

## todoList

1. 引入webpack打包build项目并进行部署
2. 模块别名的使用

## MONGO SERVE

启动常驻后台
`mongod -f /etc/mongo.conf --fork` (推荐用配置文件启动)
` mongod --dbpath=/var/lib/mongo --logpath=/var/log/mongodb/mongod.log --fork`

查看配置
`cat /etc/etc/mongo.conf`

安全验证

```
> mongo # 进入mongo交互式命令行
> use admin #进入admin数据库
  switched to db admin
> db.createUser( {user: "root",pwd: "password",roles: [ { role: "root", db: "admin" } ]}) # 在系统 admin database 上创建用户并指定密码
> db.shutdownServer() # 退出mongo

> vim /etc/mongo.conf # 编辑配置文件，配置 auth=true 启用链接认证
> mongod -f /etc/mongo.conf --fork # 重启服务
```