import { KATClient as Client } from "@structures/index.js";
import { Request, Response, NextFunction } from "express";

export function withAuth(client: Client) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.headers.authorization || req.headers.authorization != process.env.CAT_API_KEY) {
            client.logger.warn('Server >> Unauthorized Request Received');
            client.logger.request(req, 'access');

            return res.status(401).send('You are not authorized.');
        }

        next();
    };
}