import { Router } from 'express';
import { withAuth } from '../../middlewares/auth.js';
// ------------------------------------
import asapHook from './asap.js';
// ------------------------------------
const router = Router();
export default function (client) {
    router.get("/", (_, res) => res.send(`${client.user?.username} - vDEV`));
    router.use("/asap", withAuth(client), asapHook(client));
    return router;
}
;
