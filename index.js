var _ = require('lodash');
var express = require('express');
var colors = require('colors');

var app = express();
var ip = require('ip');
var dateformat = require('dateformat');
var proxy = require('./handle/proxy.js');
var setproxy = require('./middleware/setproxy.js');
var autoSave = require('./handle/autosave.js');
var load = require('./middleware/load.js');

app.express = express;
module.exports = function (_config) {
    var config = _config || {};
    config.port = config.port || 3000;
    config.proxy_file = 'proxy.pac';

    var space = '                ';
    // app.enable('trust proxy');

    // 输出日志
    app.use(function (req, res, next) {
        console.info(dateformat('yyyy-mm-dd HH:MM:ss'), req.method, ':', req.url);
        next();
    });

    // 中间件,假如中间件修改了，则下次调用请求时自动使用新的中间件
    app.use(function (req, res, next) {
            var arr = config.middleware;
            if (typeof config.middleware === 'function') {
                arr = [config.middleware];
            } else if (!(arr instanceof Array)) {
                return next();
            }
            function execMiddleWare(i) {
                if (i > arr.length) {
                    return next();
                }
                if (typeof arr[i] === 'function') {
                    console.log(i, arr[i]);
                    arr[i](req, res, ()=>execMiddleWare(i + 1));
                } else {
                    execMiddleWare(i + 1);
                }
            }

            execMiddleWare(0);
        }
    );


    // 代理文件地址
    if (config.proxy) {
        app.all('/' + proxy_file, proxy(config));
    }

    // 转发本地文件
    function localPath(res, path, stats) {
        console.info(colors.green('使用本地文件:', path, space));
    }

    if (config.static) {
        console.log('static: ', config.static);
        app.use(express.static(config.static, {setHeaders: localPath}));
    }

    if (config.statics) {
        for (var path in config.statics) {
            console.log('static: ', path, config.statics[path]);
            app.use(path, express.static(config.statics[path], {setHeaders: localPath}));
        }
    }

    // 忽略favicon文件
    app.get('/favicon.ico', function (req, res) {
        console.log('忽略该文件！                    ');
        res.end();
    });


    // 未找到的文件自动转发原地址
    app.use(load(config, function (url, response, file) {
        // 自动保存文件
        if (typeof autoSave === 'function' && config.autoSave) {
            autoSave(config, url, file);
        }
    }));

    app.use(function (req, res, next) {
        res.status(404).send('Not Found!');
        res.end();
        console.log(colors.red('未找到文件：', req.url, space));
    });

    app.listen(config.port, function () {
        console.info('启动服务器: http://localhost:' + config.port + '/', space);
        if (config.proxy) {
            var addr = 'http://' + ip.address() + ':' + config.port + '/' + proxy_file;
            console.info('代理文件地址: ' + addr, space);
            setproxy(addr);
            console.info('被代理的网址：            \n', config.proxy.join ? config.proxy.join('       \n') : config.proxy, space);
        }
    });

    return app;
};
