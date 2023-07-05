!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="4993bf27-0e20-5ff1-9e27-fe3d8ece18b2")}catch(e){}}();
import { Router } from 'express';
const router = Router();
import * as BotController from '../controllers/bot.controller.js';
export default (client) => {
    router.get('/', BotController.fetchStats(client));
    return router;
};
//# debugId=4993bf27-0e20-5ff1-9e27-fe3d8ece18b2
//# sourceMappingURL=stats.js.map
