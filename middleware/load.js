/**加载网路数据**/
var request = require('request'),
    _ = require('lodash'),
    colors = require('colors');

var resHeaders = [];

module.exports = function (config, callback) {
    return function (req, res, next) {
        var headers = {}, params = [
            'Accept-Language',
            'Accept',
            'Cookie',
            'Proxy-Connection',
            'Referer',
            'User-Agent',
            'X-Requested-With',
            'Host',
            'Cache-Control',
            'Pragma',
            'Referer'];
        for (var i in params) {
            var param = params[i];
            var temp = req.header(param);
            temp && (headers[param] = req.header(param));
        }
        if (config.headers && typeof config.headers == 'object') {
            headers = _.extend(headers, config.headers);
        }
        if (typeof config.setReqHeader === 'function') {
            config.setReqHeader(headers, req.url, req);
        }

        // console.log(headers);
        // 避免request从本地位置加载
        var host = headers.Host;
        if (host.indexOf('localhost:' + config.port) >= 0 || host.indexOf('127.0.0.1:' + config.port) >= 0) {
            next();
            return;
        }
        var url = req.url.indexOf('http') == 0 ? req.url : 'http://' + headers.Host + req.url;
        try {

            request({
                url: 'http://' + headers.Host + req.url,
                gzip: false,
                headers: headers
            }, function (error, response, body) {
                if (response && response.statusCode == 200) {
                    res.set(response.headers);
                    res.send(body);
                    console.log(colors.green('加载网络数据：', headers['Host'] + req.url, '              '));
                    if (typeof callback === 'function') {
                        callback(req.url, response, body);
                    }
                } else {
                    console.log(colors.red('加载网络数据失败：', url, error, response && response.statusCode, '              '));
                    next();
                }
            });
        } catch (e) {
            console.log(colors.red('加载地址出错：', headers['Host'] + req.url, e, '        '));
        }
    }
};
