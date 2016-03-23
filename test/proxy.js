var proxy = require('./../index.js');
proxy({
    port: 3002,
    proxy: [
        'www.test.com', /www\.test\.com\//
    ],
    statics: {
        '/': __dirname + '/public/',
        '/test': __dirname + '/public/'
    },
    autoSave: {
        '/css/': './saveto/'
    }
});