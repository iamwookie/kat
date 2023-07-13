import { KATClient as Client } from '@structures/index.js';
import { Router } from 'express';

import * as PermissionsController from '@api/controllers/permissions.controller.js';

const router = Router();

export default (client: Client) => {
    router.get('/', PermissionsController.fetchPermissions(client));
    return router;
};
