import { Router } from 'express';
import { withLimiter } from '../middlewares/limiter.js';
// ------------------------------------
import statsRoute from './stats.js';
import inviteRoute from './invite.js';
import usersRoute from './users.js';
import hooksRoute from './hooks/index.js';
// ------------------------------------
import packageJson from '../../../package.json' assert { type: "json" };
const router = Router();
export default function (client) {
    router.get('/', (_, res) => res.send(`${client.user?.username} - v${packageJson.version}`));
    router.use('/stats', statsRoute(client));
    router.use('/invite', inviteRoute(client));
    router.use('/users', withLimiter, usersRoute(client));
    router.use('/hooks', withLimiter, hooksRoute(client));
    return router;
}
;
