/**加载网路数据**/
var request = require('request'),
    _ = require('lodash'),
    colors = require('colors'),
    ip = require('ip');

var resHeaders = [];

function isLocal(host, config) {
    if (host.indexOf('localhost') >= 0 || host.indexOf('127.0.0.1') >= 0 || host.indexOf(ip.address()) >= 0) {
        if (config.port == 80) {
            return host.match(/(\d+\.){3}\d+(:80)?$/);
        } else {
            return host.indexOf(':' + config.port) > 0;
        }
    }
}


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
            'Proxy-Connection',
            'Referer'];
        for (var i in params) {
            var param = params[i];
            var temp = req.header(param);
            temp && (headers[param] = req.header(param));
        }
        if (config.headers && typeof config.headers == 'object') {
            headers = _.extend(headers, config.headers);
        }

        if (headers.Host.indexOf('localhost') < 0) {
            /**修改header中的host时，顺便修改Referer和Origin*/
            if (headers.Referer && (!config.headers || !config.headers.Referer)) {
                headers.Referer = headers.Referer.replace(/http:\/\/.*?\//g, 'http://' + headers.Host + '/');
            }
            if (headers.Origin && (!config.headers || !config.headers.Origin)) {
                headers.Origin = headers.Origin.replace(/http:\/\/.*?(\/|$)/g, 'http://' + headers.Host);
            }
        }

        if (typeof config.setReqHeader === 'function') {
            config.setReqHeader(headers, req.url, req);
        }

        // console.log(headers);
        // 避免request从本地位置加载
        if (isLocal(headers.Host, config)) {
            next();
            return;
        }
        var url = req.url.indexOf('http') == 0 ? req.url : 'http://' + headers.Host + req.url;
        try {

            request({
                method: req.method,
                url: url,
                gzip: false,
                headers: headers,
                form: req.body
            }, function (error, response, body) {
                if (response && response.statusCode == 200) {
                    res.set(response.headers);
                    res.send(body);
                    req.log('magenta', ' LoadFromWeb: ', url, '              ');
                    if (typeof callback === 'function') {
                        callback(req.url, response, body);
                    }
                } else {
                    req.log('red', ' LoadFailure: ', url, error, 'response:', response);
                    next();
                }
            });
        } catch (e) {
            req.log('red', ' LoadError: ', headers['Host'] + req.url, e, '        ');
        }
    }
};
