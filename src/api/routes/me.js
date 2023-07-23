!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="6e478cd6-936f-5baf-b393-67fab5b23a57")}catch(e){}}();
import { Router } from 'express';
import { withLimiter } from '../middlewares/limiter.middleware.js';
import * as UserController from '../controllers/user.controller.js';
const router = Router();
export default (client) => {
    router.get('/', withLimiter, UserController.fetchMe(client));
    return router;
};
//# debugId=6e478cd6-936f-5baf-b393-67fab5b23a57
//# sourceMappingURL=me.js.map
