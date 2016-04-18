/**pac代理文件*/

/** 假如配置可以其他设备上使用的话，推荐使用ip地址，可以使用localhost或者127.0.0.1 */

var config = {
    'PROXY localhost:3000;DIRECT': [/www\.test\.com\//]
};

// [PROXY-CONFIG]


function UrlRule(url, rule) {
    if (!rule) {
        return false;
    }
    if (typeof rule === 'string') {
        // 字符串
        if (url.indexOf(rule) >= 0) {
            return true;
        }
    } else if (rule instanceof Array) {
        // 数组
        for (var i = 0; i < rule.length; i++) {
            if (UrlRule(url, rule[i])) {
                return true;
            }
        }
    } else if (rule instanceof RegExp) {
        if (rule.test(url)) {
            return true;
        }
    }
    return false;
}


function FindProxyForURL(url, host) {
    for (var proxy in config) {
        if (UrlRule(url, config[proxy])) {
            return proxy;
        }
    }

    return "DIRECT";
}