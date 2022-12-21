const { createLog } = require('@server/utils/logs');

exports.withMethods = (client, options) => {
    if (!options || !Array.isArray(options)) throw new Error('Invalid methods!');

    return ((req, res, next) => {
        if (!options.includes(req.method)) {
            client.logger?.warn('>> Disallowed Method Used'.red);
            createLog(req, 'Disallowed Method', 'access');

            const allowed = options.join(', ');
            res.set('Allow', allowed);
            return res.status(405).send('Method Not Allowed');
        }

        next();
    });
};