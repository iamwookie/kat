!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="3ac96a93-bb8f-5ff3-af3e-bb0f5c4cdcc9")}catch(e){}}();
import { Router } from 'express';
const router = Router();
import * as PermissionsController from '../controllers/permissions.controller.js';
export default (client) => {
    router.get('/', PermissionsController.fetchPermissions(client));
    return router;
};
//# debugId=3ac96a93-bb8f-5ff3-af3e-bb0f5c4cdcc9
//# sourceMappingURL=permissions.js.map
