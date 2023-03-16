import { Router } from 'express';
import { Client } from 'discord.js';
import { fetchInvite } from '@api/controllers/bot.js';

const router = Router();

export default function (client: Client): Router {
    // /invite/:?admin=(true|false)
    router.get('/', fetchInvite(client));

    return router;
};
