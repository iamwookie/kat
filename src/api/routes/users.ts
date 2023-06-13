import { KATClient as Client } from '@structures/index.js';
import { Router } from 'express';
import { withLimiter } from '@api/middlewares/limiter.middleware.js';
const router = Router();

import * as UserController from '@api/controllers/user.controller.js';

export default (client: Client) => {
    router.get('/:id', withLimiter, UserController.fetchUser(client));
    return router;
}
