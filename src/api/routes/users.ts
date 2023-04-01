import { KATClient as Client } from "@structures/index.js";
import { Router } from 'express';

import { fetchUser } from '@api/controllers/user.js';

const router = Router();

export default function (client: Client) {
    // /users/:id
    router.get('/:id', fetchUser(client));

    return router;
};

