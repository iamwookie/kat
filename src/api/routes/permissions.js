!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="a497f428-5047-5369-b5dd-6897240003dc")}catch(e){}}();
import { Router } from 'express';
import * as PermissionsController from '../controllers/permissions.controller.js';
const router = Router();
export default (client) => {
    router.get('/', PermissionsController.fetchPermissions(client));
    return router;
};
//# debugId=a497f428-5047-5369-b5dd-6897240003dc
//# sourceMappingURL=permissions.js.map
