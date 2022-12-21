// Auth controller for express

const { createLog } = require('@server/utils/logs');

exports.withAuth = client => {
    return (req, res, next) => {
        if (!req.headers.authorization || req.headers.authorization != process.env.CAT_API_KEY) {
            client.logger?.warn('Server >> Unauthorized Request Received'.red);
            createLog(req, 'Unauthorized', 'access');

            return res.status(401).send('You are not authorized.');
        }

        next();
    };
}