import { KATClient as Client } from '@structures/index.js';
import { Router } from 'express';
import { withLimiter } from '@api/middlewares/limiter.middleware.js';

import * as UserController from '@api/controllers/user.controller.js';

const router = Router();

export default (client: Client) => {
    router.get('/', withLimiter, UserController.fetchMe(client));
    return router;
}
