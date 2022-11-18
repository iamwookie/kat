const { createLog } = require('@server/utils/logs');

exports.withMethods = (options) => {
    if (!options || !Array.isArray(options)) throw new Error('Invalid methods!');

    return ((req, res, next) => {
        if (!options.includes(req.method)) {
            console.log('>> Disallowed Method Used'.red);
            createLog(req, 'Disallowed Method', 'access');

            const allowed = options.join(', ');
            res.set('Allow', allowed);
            return res.status(405).send('Method Not Allowed');
        }

        next();
    });
};