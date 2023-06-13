import { Router } from 'express';
const router = Router();
import * as BotController from '../controllers/bot.controller.js';
export default (client) => {
    router.get('/', BotController.fetchStats(client));
    return router;
};
