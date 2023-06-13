import { KATClient as Client } from '@structures/index.js';
import { Router } from 'express';
const router = Router();

import * as PermissionsController from '@api/controllers/permissions.controller.js';

export default (client: Client) => {
    router.get('/', PermissionsController.fetchPermissions(client));
    return router;
}
