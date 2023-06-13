import rateLimit from 'express-rate-limit';
import { server as config } from '../../../config.js';
export const withLimiter = rateLimit({
    windowMs: config.limiter.duration * 60 * 1000,
    max: config.limiter.max,
    message: "You're being rate limited.",
    standardHeaders: true,
    legacyHeaders: false,
});
