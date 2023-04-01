import { Router } from 'express';
import { fetchStats } from '../../../src/api/controllers/bot.js';
const router = Router();
export default function (client) {
    // /stats
    router.get('/', fetchStats(client));
    return router;
}
