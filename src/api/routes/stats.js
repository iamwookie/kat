!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="cb1e1b68-b0d0-5345-ae3f-16554f45e52a")}catch(e){}}();
import { Router } from 'express';
import * as BotController from '../controllers/bot.controller.js';
const router = Router();
export default (client) => {
    router.get('/', BotController.fetchStats(client));
    return router;
};
//# debugId=cb1e1b68-b0d0-5345-ae3f-16554f45e52a
//# sourceMappingURL=stats.js.map
