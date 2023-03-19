import { Router } from 'express';
import { fetchUser } from '../controllers/user.js';
const router = Router();
export default function (client) {
    // /users/:id
    router.get('/:id', fetchUser(client));
    return router;
}
;
