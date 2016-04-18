var proxy = require('./../index.js');
proxy({
    port: 3002,
    // proxy: 'www.test.com',
    // other proxy    ['www.test.com',/www\.test\.com/]
    statics: {
        '/': __dirname + '/public/',
        '/test': __dirname + '/public/'
    },
    headers: {
        'Host': 'apps.bdimg.com',
        'Referer': '‌http://apps.bdimg.com'
    },

    autoSave: {
        '/css/': './saveto/'
    }
});