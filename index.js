var default_config = require('./config.js');
var _ = require('lodash');
var express = require('express');
var request = require('request');

var app = express();
var ip = require('ip');
var dateformat = require('dateformat');
var proxy = require('./middleware/proxy.js');
var setproxy = require('./middleware/setproxy.js');
var autoSave = require('./middleware/autosave.js');

module.exports = function (_config) {
    var config = _.assign(default_config, _config);
    var proxy_file = config.proxy_file_name || 'proxy-static.pac';
    var space = '                     ';
    // app.enable('trust proxy');

    // 输出日志
    app.use(function (req, res, next) {
        console.info(dateformat('yyyy-mm-dd HH:MM:ss'), req.method, ':', req.url);
        next();
    });

    // 自动保存文件
    if (typeof autoSave === 'function' && config.autoSave) {
        app.use(autoSave(config));
    }

    // 代理文件地址
    app.use('/' + proxy_file, proxy(config));

    // 转发本地文件
    function localPath(res, path) {
        console.info('本地文件:', path, space);
    }

    for (var path in config.statics) {
        app.use(path, express.static(config.statics[path], {setHeaders: localPath}));
    }
    app.get('/favicon.ico', function (req, res) {
        console.log('忽略该文件！                    ');
        res.end();
    });

    // 未找到的文件自动转发原地址
    app.use(function (req, res, next) {
        // console.log('this request need proxy；');
        try {
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
        } catch (e) {
            next();
        }
    });

    app.use(function (req, res, next) {
        console.log('未找到文件：', req.url, space);
        res.end();
    });
    app.listen(config.port, function () {
        console.info('启动服务器: http://localhost:' + config.port + '/', space);
        var addr = 'http://' + ip.address() + ':' + config.port + '/' + proxy_file;
        console.info('代理文件地址: ' + addr, space);
        setproxy(addr);
        console.info('被代理的网址：', config.proxy.join('\n'), space);
    });
};