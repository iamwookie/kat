import { KATClient as Client } from '@structures/index.js';
import { Router } from 'express';
const router = Router();

import * as BotController from '@api/controllers/bot.controller.js';

export default (client: Client) => {
    router.get('/', BotController.fetchStats(client));
    return router;
}