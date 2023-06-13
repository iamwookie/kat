import { Router } from 'express';
const router = Router();
import * as PermissionsController from '../controllers/permissions.controller.js';
export default (client) => {
    router.get('/', PermissionsController.fetchPermissions(client));
    return router;
};
