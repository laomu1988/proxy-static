var default_config = require('./config.js');
var _ = require('lodash');
var express = require('express');
var request = require('request');
var url = require('url');
var fs = require('fs');
var app = express();
var proxy = require('./middleware/proxy.js');
var setproxy = require('./middleware/setproxy.js');


var proxy_file = 'proxy-static.pac';

module.exports = function (_config) {
    var config = _.assign(default_config, _config);

    // app.enable('trust proxy');

    // 输出日志
    app.use(function (req, res, next) {
        console.info(new Date(), req.method, ':', req.url);
        next();
    });

    app.get('/favicon.ico', function () {
    });
    app.use('/' + proxy_file, proxy(config));

    // 转发本地文件
    for (var path in config.statics) {
        app.use(path, express.static(config.statics[path]));
    }

    // 未找到的文件自动转发原地址
    app.use(function (req, res) {
        // console.log('this request need proxy；');
        switch (req.method) {
            case 'GET':
                req.pipe(request(req.url)).pipe(res);
                break;
            case 'POST':
                req.pipe(request.post(req.url, {form: req.body})).pipe(res);
                break;
            default:
                console.log(req.method);
        }
        return;
        var data = url.parse(req.url);
        if (data.pathname.indexOf('/v1/' === 0)) {
            console.log('save file:', data.pathname);
            /*
             // 写入编码错误
             req.pipe(request(req.url)).pipe(fs.createWriteStream(__dirname + data.pathname, {
             flags: 'w',
             defaultEncoding: 'utf8',
             autoClose: true
             }));
             */
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
                if (response.statusCode == 200) {
                    console.log(body);
                    var b = JSON.parse(body);
                    console.log(b);
                    if (b && b.errno == 0) {
                        console.log('写入文件:', data.pathname);
                        fs.writeFileSync(__dirname + data.pathname, JSON.stringify(b, null, 4), 'utf8');
                    }
                    //console.log(body);
                }
            });

        }
    });

    app.use(function (req, res, next) {
        res.json('{errno: 404,errmsg: "未找到页面"}')
    });
    app.listen(config.port, function () {
        console.log('start proxy-static server: http://localhost:' + config.port + '/');
        setproxy('http://localhost:' + config.port + '/' + proxy_file);
    });
};