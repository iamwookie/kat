import { Router } from 'express';
import { Client } from 'discord.js';
import { fetchStats } from 'src/api/controllers/bot.js';

const router = Router();

export default function (client: Client): Router {
    // /stats
    router.get('/', fetchStats(client));

    return router;
}