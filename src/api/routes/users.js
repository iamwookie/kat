import { Router } from 'express';
import { withLimiter } from '../middlewares/limiter.middleware.js';
const router = Router();
import * as UserController from '../controllers/user.controller.js';
export default (client) => {
    router.get('/:id', withLimiter, UserController.fetchUser(client));
    return router;
};
