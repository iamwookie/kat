export const withAuth = (req, res, next) => {
    if (req.headers.authorization != process.env.KAT_API_KEY)
        return res.status(401).send('You are not authorized.');
    next();
};
