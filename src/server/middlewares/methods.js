exports.methods = (options) => {
    if (!options || !Array.isArray(options)) throw new Error('Invalid methods!');

    return ((req, res, next) => {
        if (!options.includes(req.method)) {
            console.log('>> Disallowed Method Used'.red);
            log(req, 'Disallowed Method', 'access');

            const allowed = options.join(', ');
            res.set('Allow', allowed);
            return res.status(405).send('Method Not Allowed');
        }

        next();
    });
};