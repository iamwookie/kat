import { Router } from 'express';
import { sendUnbox, sendSuits, sendStaff } from '../../hooks/asap.js';
const router = Router();
export default function (client) {
    // /hooks/asap/unbox
    router.post('/unbox', sendUnbox(client));
    // /hooks/asap/suit
    router.post('/suits', sendSuits(client));
    // /hooks/asap/staff
    router.post('/staff', sendStaff(client));
    return router;
}
;
