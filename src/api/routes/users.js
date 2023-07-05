!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="9bae52a8-e58f-5cdd-80ee-2454d3c44513")}catch(e){}}();
import { Router } from 'express';
import { withLimiter } from '../middlewares/limiter.middleware.js';
const router = Router();
import * as UserController from '../controllers/user.controller.js';
export default (client) => {
    router.get('/:id', withLimiter, UserController.fetchUser(client));
    return router;
};
//# debugId=9bae52a8-e58f-5cdd-80ee-2454d3c44513
//# sourceMappingURL=users.js.map
