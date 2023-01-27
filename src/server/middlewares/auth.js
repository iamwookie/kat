// Auth controller for express

exports.withAuth = client => {
    return (req, res, next) => {
        if (!req.headers.authorization || req.headers.authorization != process.env.CAT_API_KEY) {
            client.logger?.warn('Server >> Unauthorized Request Received'.red);
            client.logger?.request(req, 'access');

            return res.status(401).send('You are not authorized.');
        }

        next();
    };
}