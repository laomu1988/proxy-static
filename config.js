module.exports = {
    // 本地服务器端口
    port: 3000,
    // 改路径时使用本地文件，url => local
    statics: {
        '/': __dirname + '/'
    },
    // 配置代理文件，正则表达式或者字符串构成的数组，匹配正则表达式或者数组就会被代理到此服务
    proxy: [
        /www\.test\.com\//
    ]
    /*todo: 将网络请求的数据保存到本地
     autoSaveData: {
     '/v1/': '/v1/'
     },
     404: ''*/
};