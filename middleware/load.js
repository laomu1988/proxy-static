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
        if (typeof config.setHeader === 'function') {
            headers = config.setHeader(headers);
        }

        // console.log(headers);
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
                    console.log(colors.red('加载网络数据失败：', headers['Host'] + req.url, error, response && response.statusCode, '              '));
                }
            });
        } catch (e) {
            console.log(colors.red('加载地址出错：', headers['Host'] + req.url, e, '        '));
        }
    }
};