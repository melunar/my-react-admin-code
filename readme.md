
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