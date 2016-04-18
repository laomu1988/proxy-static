var fs = require('fs');
var url = require('url');

module.exports = function (config, _url, body) {
    var urlParse = url.parse(_url);
    var paths = config.autoSave;
    for (var path in paths) {
        if (urlParse.pathname.indexOf(path) === 0) {
            fs.writeFileSync(((paths[path] ? paths[path] : '') + urlParse.pathname).replace(/\/\//g, '/'), body, 'utf8');
        }
    }
};