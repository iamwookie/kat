import rateLimit from "express-rate-limit";
import Config from "../../../config.js";
export const withLimiter = rateLimit({
    windowMs: Config.server.limiter.duration * 60 * 1000,
    max: Config.server.limiter.max,
    message: "You're being rate limited.",
    standardHeaders: true,
    legacyHeaders: false,
});
