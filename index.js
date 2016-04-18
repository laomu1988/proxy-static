var default_config = require('./config.js');
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


    // 代理文件地址
    app.use('/' + proxy_file, proxy(config));

    // 转发本地文件
    function localPath(res, path) {
        console.info('使用本地文件:', path, space);
    }

    if (config.static) {
        app.use(express.static(config.static, {setHeaders: localPath}));
    }

    if (config.statics) {
        for (var path in config.statics) {
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
        console.log('加载数据成功！');
        // 自动保存文件
        if (typeof autoSave === 'function' && config.autoSave) {
            autoSave(config, url, file);
        }
    }));

    app.use(function (req, res, next) {
        console.log(colors.red('未找到文件：', req.url, space));
        res.end();
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
};