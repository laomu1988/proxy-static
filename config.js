module.exports = {
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
    // 修改req header
    setReqHeader: function (headers) {
        return headers;
    },
    // express 中间件,函数或者函数数组
    middleware: function (req, res, next) {
        next();
    },

    //将网络请求的数据保存到本地
    autoSave: {
        '/v1/': '/v1/'
    }
};