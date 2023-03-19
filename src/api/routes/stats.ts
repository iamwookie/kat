import { KATClient as Client } from "@structures/index.js";
import { Router } from 'express';

import { fetchStats } from 'src/api/controllers/bot.js';

const router = Router();

export default function (client: Client): Router {
    // /stats
    router.get('/', fetchStats(client));

    return router;
}