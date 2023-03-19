import { Router } from 'express';
import { fetchInvite } from '../controllers/bot.js';
const router = Router();
export default function (client) {
    // /invite/:?admin=(true|false)
    router.get('/', fetchInvite(client));
    return router;
}
;
