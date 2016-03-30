var request = require('request');
var fs = require('fs');
function requestAndSave(req, saveTo) {
    var headers = {}, params = ['Accept-Language', 'Accept', 'Cookie', 'Proxy-Connection', 'Referer', 'User-Agent', 'X-Requested-With', 'HOST'];
    for (var i in params) {
        var param = params[i];
        headers[param] = req.header(param);
    }
    // console.log(headers);
    try {
        request({
            uri: req.url,
            gzip: false,
            headers: headers
        }, function (error, response, body) {
            if (response && response.statusCode == 200) {
                console.log('保存文件到本地:', saveTo, '            ');
                //console.log(body);
                fs.writeFileSync(saveTo, body, 'utf8');
            }else{

            }
        });
    } catch (e) {
        console.log('加载地址出错：', headers['HOST'] + req.url);
    }
}

module.exports = function (config) {
    var url = require('url');
    return function (req, res, next) {
        var urlParse = url.parse(req.url);
        var paths = config.autoSave;
        for (var path in paths) {
            if (urlParse.pathname.indexOf(path) === 0) {
                requestAndSave(req, ((paths[path] ? paths[path] : '') + urlParse.pathname).replace(/\/\//g, '/'));
            }
        }

        next();
    }
};