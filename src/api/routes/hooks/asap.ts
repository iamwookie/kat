import { Router, Request, Response } from 'express';
import { Client } from 'discord.js';
import { sendUnbox, sendSuits, sendStaff } from '@api/hooks/asap.js';

const router = Router();

export default function (client: Client): Router {
    // /hooks/asap/unbox
    router.post('/unbox', sendUnbox(client));

    // /hooks/asap/suit
    router.post('/suits', sendSuits(client));

    // /hooks/asap/staff
    router.post('/staff', sendStaff(client));

    return router;
};