!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="5c80a101-99e6-5346-9b0b-5fd92290edd4")}catch(e){}}();
import { Router } from 'express';
import { withLimiter } from '../middlewares/limiter.middleware.js';
import * as UserController from '../controllers/user.controller.js';
const router = Router();
export default (client) => {
    router.get('/', withLimiter, UserController.fetchMe(client));
    return router;
};
//# debugId=5c80a101-99e6-5346-9b0b-5fd92290edd4
//# sourceMappingURL=me.js.map
