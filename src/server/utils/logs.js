const fs = require('fs');

exports.createLog = (req, type, scope, error) => {
    let time = Date.now();

    if (this.lastIp && this.lastIp == req.ip) return console.log('>> Received Duplicate Request'.red);

    this.lastIp = req.ip;

    fs.appendFile(`./${scope}.log`, `TYPE: '${type}' CODE: '${time}' IP: '${req.ip} ${error ? '\nERROR: ' + error.stack : ''}\n`, async (err) => {
        if (err) throw (err);
        return console.log(`[Authenticator] >> Logged Request (${type}), CODE: `.yellow + `${time}`.green + ', IP: '.yellow + `${req.ip}`.green);
    });
}