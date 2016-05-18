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
var bodyParser = require('body-parser');

// 简化输出日志
app.log = function () {
    var color = 'white', content;
    if (arguments.length > 1 && colors[arguments[0]]) {
        color = arguments[0];
        content = Array.prototype.slice.call(arguments, 1);
    } else {
        color = 'white';
        content = Array.prototype.slice.call(arguments);
    }
    content.unshift();
    console.log(colors.green(dateformat('yyyy-mm-dd HH:MM:ss'), ':', this._path || ''), colors[color].apply(colors, content));
};

app.express = express;
module.exports = function (_config) {
    var config = _config || {};
    config.port = config.port || 3000;
    config.proxy_file = 'proxy.pac';

    var space = '                ';
    // app.enable('trust proxy');
    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded


    // 输出日志
    app.use(function (req, res, next) {
        req._path = req.path;
        req._method = req.method;
        req._url = req.url;
        req._start = new Date();
        res.log = req.log = app.log.bind(req);
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
                    // console.log(i, arr[i]);
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
        res.log('cyan', 'LocalFile:', path, space);
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
        req.log('Ignore');
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
        res.status(404).send('{"errno":404,"msg":"Not Found!"}');
        res.end();
        res.log('red', ' Not Found!', space);
    });

    app.listen(config.port, function () {
        console.log(colors.green('****** 启动服务器: http://localhost:' + config.port + '/', space + '*************\n***************************************************************'));
        if (config.proxy) {
            var addr = 'http://' + ip.address() + ':' + config.port + '/' + proxy_file;
            console.info('代理文件地址: ' + addr, space);
            setproxy(addr);
            console.info('被代理的网址：            \n', config.proxy.join ? config.proxy.join('       \n') : config.proxy, space);
        }
    });

    return app;
};
