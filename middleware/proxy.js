/** 生成代理文件 */
var fs = require('fs');

function ProxyString(proxy) {
    var str = '';
    if (proxy instanceof Array) {
        if (proxy.length > 0) {
            for (var i = 0; i < proxy.length; i++) {
                str += ProxyString(proxy[i]) + ',';
            }
            str = str.substr(0, str.length - 1);
        }
    } else if (typeof proxy === 'string') {
        return '"' + proxy + '"';
    } else if (proxy instanceof RegExp) {
        return proxy.toString();
    }
    return str;
}

module.exports = function (config) {
    console.log(config);
    var str = ProxyString(config.proxy);
    if (!str) {
        console.error('没有配置代理网址：config.proxy');
    }
    var proxy_source = fs.readFileSync(__dirname + '/proxy.pac', 'utf8');
    var proxy_str = '[PROXY-CONFIG]\n\nconfig = {"PROXY localhost:' + config.port + ';DIRECT":[' + str + ']};';
    proxy_source = proxy_source.replace('[PROXY-CONFIG]', proxy_str);

    return function (req, res, next) {
        if (req && res) {
            res.set('Content-Type', 'text/plain');
            res.send(proxy_source);
        }
    }
};