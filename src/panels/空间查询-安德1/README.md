> xplugin-template-panel 面板插件模板代码
* 面板插定义
    > </br>
    > 场景中以面板嵌入图表的形式呈现孪生体属性(或自定义)数据。</br>例如:</br>
    > 可配置“基础信息”孪生体面板插件,呈现孪生体属性相关信息</br>    
    > 可配置“实时数据”孪生体面板插件,呈现孪生体指标相关信息</br>
    > 可配置“反向控制”孪生体面板插件,控制孪生体形态变化</br>
    > 可配置“图表”面板插件,业务激活时显示业务图表区域图表或图表插件</br>
    > </br>
* 相关命令
  ```javascript
    - npm install          -- to install dependencies
    - npm run test         -- environmental testing,测试运行环境是否满足要求
    - npm run dev          -- to build the project for development
    - npm run start        -- to run the project
    - npm run build:prod   -- to build the project for production
    - npm run build:pack   -- to pack the project for production
  ```
* 包含的主要文件
  ```javascript
  xplugin-template-panel //面板插件模板代码
  | +-- config         //配置目录
  |   --- index.js     //配置插件开发的环境信息
  | +-- src            //源代码目录(主要开发目录)
  |   +-- panel        //开发主目录
  |     --- bundle.js  //插件资源描述文件
  |     --- index.js   //开发入口文件(主要逻辑)
  |     --- index.vue  //开发UI相关vue主文件  
  |     --- index.json //配置项控件文件
  |     --- debugger.json //配置项控件调试文件
  |     +-- components    //子(组件)文件目录,拆分逻辑推荐使用
  |     +-- resources     //资源文件,资源图片等信息目录 
  | --- thingjsx.config.js//插件资源打包编译配置文件
  | --- README.md         //插件使用说明文档
  | --- package.json      //构建文件
  | --- index.js          //插件模板逻辑文件(未了解学习插件规范的情况下,不推荐修改,修改可能造成打包后的插件无法使用)
  | --- index.bundle.js   //插件模板描述文件逻辑(未了解学习插件规范的情况下,不推荐修改,修改可能造成打包后的插件无法使用)

  ```
  * /config/index.js                文件解构[配]
  * /src/panel/bundle.js            文件解构
  * /src/panel/index.js             文件解构
  * /src/panel/index.vue            文件解构[新]
  * /src/panel/debugger.json        文件解构
  * /src/panel/index.json           文件解构
  * thingjsx.config.js              文件解构[配]

# TODO 需要开发者依据开发内容进行文档补充整理(完善具体插件相关内容介绍等)


# 资源名称,例如: 视频监控面板
> 插件类型: 面板插件
```text
   插件简介
```

# 效果展示
<img src="./src/panel/resources/preview.png" width = "200" height = "200" alt="效果预览图" />

# 资源介绍
  
# 使用场景