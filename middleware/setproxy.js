/**设置本地代理*/

module.exports = function (proxy, update_cmd) {
    update_cmd = update_cmd || 'proxy';
    var info = '输入命令(' + update_cmd + ')即可更新代理文件。                   ';
    // mac写入代理文件,输入rs命令更新rs
    if (require('os').platform() === 'darwin') {
        try {
            var process = require('process');
            process.stdin.resume();
            process.stdin.setEncoding('utf8');
            process.stdin.on('data', function (chunk) {
                if (chunk.indexOf(update_cmd) == 0) {
                    // 使用rs命令重新设置代理
                    console.log(info);
                    require('child_process').exec('networksetup -setautoproxyurl "Wi-Fi" "' + proxy + '?_t=' + Date.now() + '"');
                }
            });
            process.stdin.on('end', function () {
                process.stdout.write('the end!!!');
            });
            console.log(info);
            require('child_process').exec('networksetup -setautoproxyurl "Wi-Fi" "' + proxy + '?_t=' + Date.now() + '"');
        } catch (e) {
            console.log(e);
        }

    }
};