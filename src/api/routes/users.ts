import { Router } from 'express';
import { Client } from 'discord.js';
import { fetchUser } from '@api/controllers/user.js';

const router = Router();

export default function (client: Client): Router {
    // /users/:id
    router.get('/:id', fetchUser(client));

    return router;
};

