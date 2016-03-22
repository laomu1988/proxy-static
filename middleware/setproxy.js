/**设置本地代理*/

module.exports = function (proxy, update_cmd) {
    update_cmd = update_cmd || 'proxy';
    // mac写入代理文件,输入rs命令更新rs
    if (require('os').platform() === 'darwin') {
        var process = require('process');
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', function (chunk) {
            if (chunk.indexOf(update_cmd) == 0) {
                // 使用rs命令重新设置代理
                console.log('设置代理,输入' + update_cmd + '更新代理');
                require('child_process').exec('networksetup -setautoproxyurl "Wi-Fi" "' + proxy + '?_t=' + Date.now() + '"');
            }
        });
        process.stdin.on('end', function () {
            process.stdout.write('the end!!!');
        });
        console.log('设置代理,输入' + update_cmd + '更新代理');
        require('child_process').exec('networksetup -setautoproxyurl "Wi-Fi" "' + proxy + '?_t=' + Date.now() + '"');
    }
};