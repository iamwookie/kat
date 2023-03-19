import { KATClient as Client } from "@structures/index.js";
import { Router } from 'express';

import { fetchInvite } from '@api/controllers/bot.js';

const router = Router();

export default function (client: Client): Router {
    // /invite/:?admin=(true|false)
    router.get('/', fetchInvite(client));

    return router;
};
