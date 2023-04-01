export function withAuth(client) {
    return (req, res, next) => {
        if (!req.headers.authorization || req.headers.authorization != process.env.KAT_API_KEY) {
            client.logger.warn('Server >> Unauthorized Request Received');
            client.logger.request(req, 'access');
            return res.status(401).send('You are not authorized.');
        }
        next();
    };
}
