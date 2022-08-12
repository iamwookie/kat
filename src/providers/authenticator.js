const fs = require('fs');
const rateLimit = require('express-rate-limit');

const { server } = require('@root/config.json');

class Authenticator {
    static key = '';

    static validate() {
        return ((req, res, next) => {
            console.log('[Authenticator] >> Gateway Request Received'.red);
            Authenticator.log(req, 'Gateway', 'access');

            next();
        });
    }

    static auth() {
        return ((req, res, next) => {
            if (!req.headers.authorization || req.headers.authorization != Authenticator.key) {
                console.log('[Authenticator] >> Unauthorized Request Received'.red);
                Authenticator.log(req, 'Unauthorized', 'access');

                return res.status(401).send('You are not authorized.');
            }

            next();
        });
    }

    static limiter() {
        return rateLimit({
            windowMs: server.limiter.duration * 60 * 1000,
            max: server.limiter.max,
            message: 'You\'re being rate limited.',
            standardHeaders: true,
            legacyHeaders: false,
        });
    }

    static methods(options) {
        if (!options || !Array.isArray(options)) throw new Error('Invalid methods!');

        return ((req, res, next) => {
            if (!options.includes(req.method)) {
                console.log('[Authenticator] >> Disallowed Method Used'.red);
                Authenticator.log(req, 'Disallowed Method', 'access');

                const allowed = options.join(', ');
                res.set('Allow', allowed);
                return res.status(405).send('Method Not Allowed');
            }

            next();
        });
    }

    static handler() {
        return ((err, req, res, next) => {
            Authenticator.log(req, 'Error Occured', 'error', err);
            return res.status(500).send('Internal Server Error');
        });
    }

    static log(req, type, scope, error) {
        let time = Date.now();

        if (this.lastIp && this.lastIp == req.ip) return console.log('[Authenticator] >> Received Duplicate Request'.red);

        this.lastIp = req.ip;

        fs.appendFile(`./${scope}.log`, `TYPE: '${type}' CODE: '${time}' IP: '${req.ip} ${error ? '\nERROR: ' + error.stack : ''}\n`, async (err) => {
            if (err) throw (err);

            return console.log(`[Authenticator] >> Logged Request (${type}), CODE: `.yellow + `${time}`.green + ', IP: '.yellow + `${req.ip}`.green);
        });
    }
}

module.exports = Authenticator;