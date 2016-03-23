var request = require('request');
function requestAndSave(req, saveTo) {
    var headers = {}, params = ['Accept-Language', 'Accept', 'Cookie', 'Proxy-Connection', 'Referer', 'User-Agent', 'X-Requested-With'];
    for (var i in params) {
        var param = params[i];
        headers[param] = req.header(param);
    }
    request({
        uri: req.url,
        gzip: false,
        headers: headers
    }, function (error, response, body) {
        if (response && response.statusCode == 200) {
            console.log('保存文件到本地:', urlParse.pathname);
            //console.log(body);
            fs.writeFileSync(saveTo + urlParse.pathname, body, 'utf8');
        }
    });
}

module.exports = function (config) {
    var url = require('url');
    return function (req, res, next) {
        var urlParse = url.parse(req.url);
        var paths = config.autoSave;
        for (var path in paths) {
            console.log(urlParse.pathname);
            if (urlParse.pathname.indexOf(path) === 0) {
                requestAndSave(req, paths[path] ? paths[path] : '');
            }
        }

        next();
    }
};