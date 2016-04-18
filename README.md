# proxy-static
* 转发网络请求到本地，便于前端开发本地调试
* mac版自动打开pac配置窗口并配置
* 本地数据不存在时自动使用网络数据

# todo：
* 增加中间件配置项，用户可以随意配置
* 记录请求数据
* 自动获取当前代理内容，写入新的代理文件避免影响之前使用的代理

# 使用方法
* 安装组件 npm install proxy-static
* 编写调用文件，例如proxy.js
```
var proxy = require('proxy-static');
proxy({
    // 本地服务器端口
    port: 3000,
    // 改路径时使用本地文件，url => local
    statics: {
        '/': __dirname + '/'
    },
    // 配置代理文件，正则表达式或者字符串构成的数组，匹配正则表达式或者数组就会被代理到此服务,可以不用设置
    proxy: [/www\.test\.com\//],
    // 代理文件地址
    proxy_file_name: 'proxy.pac',

    // 设置header
    headers: {
        Host: '', // 修改host
        Origin: '',
        Cookie: '',// 发送到服务器时需要添加的cookie
    },
    // 修改header
    setHeader: function (headers) {
        return headers;
    },

    //将网络请求的数据保存到本地
    autoSave: {
        '/v1/': '/v1/'
    }
});
```
* 执行node proxy.js，假如是mac平台，此时会弹出代理设置窗口并已经输入本地地址，只需输入密码即可完成代理配置
* 打开代理网址即可查看效果


# 配置项说明[参见config.js]

| 配置项 | 类型 | 说明 |
|-------|------|-----|
| port  | int  | 本地端口，默认3000 |
| proxy | array | 要被代理的网址，字符串或者正则表达式组成，也可以是数组 |
| statics | object | 本地文件地址，假如未配置，则所有地址都将自动发送到原地址 |
| autoSave | object | 自动保存网络数据到本地 |

# 测试用例见test目录


# 更新日志
* 0.0.5 增加express middleware，可以自由处理请求
* 0.0.4 修改header，可以将本地请求转发到服务器；部分位置增加输出颜色
* 0.0.3 代理地址可以直接输入字符串，不必一定输入数组
* 0.0.2 自动保存文件到本地；修改输出内容；
* 0.0.1 网络代理转发到本地
