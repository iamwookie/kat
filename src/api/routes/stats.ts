import { KATClient as Client } from '@structures/index.js';
import { Router } from 'express';

import * as BotController from '@api/controllers/bot.controller.js';

const router = Router();

export default (client: Client) => {
    router.get('/', BotController.fetchStats(client));
    return router;
};
