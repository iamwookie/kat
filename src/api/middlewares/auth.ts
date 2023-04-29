import { Request, Response, NextFunction } from 'express';

export const withAuth = (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization != process.env.KAT_API_KEY) return res.status(401).send('You are not authorized.');

    next();
};
