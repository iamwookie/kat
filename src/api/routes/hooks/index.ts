import { Router, Request, Response } from 'express';
import { Client } from 'discord.js';

import { withAuth } from '@api/middlewares/auth.js';

// ------------------------------------
import asapHook from './asap.js';
// ------------------------------------

const router = Router();

export default function (client: Client) {
    router.get("/", (_: Request, res: Response) => res.send(`${client.user?.username} - vDEV`));

    router.use("/asap", withAuth(client), asapHook(client));

    return router;
};