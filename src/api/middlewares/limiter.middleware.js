!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="373a07d3-d151-5ab6-b031-2de45b9abd12")}catch(e){}}();
import rateLimit from 'express-rate-limit';
import { server as config } from '../../../config.js';
export const withLimiter = rateLimit({
    windowMs: config.limiter.duration * 60 * 1000,
    max: config.limiter.max,
    message: "You're being rate limited.",
    standardHeaders: true,
    legacyHeaders: false,
});
//# debugId=373a07d3-d151-5ab6-b031-2de45b9abd12
//# sourceMappingURL=limiter.middleware.js.map
