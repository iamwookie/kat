import rateLimit from "express-rate-limit";
import Config from "../../../src/configs/server.json" assert { type: "json" };
export const withLimiter = rateLimit({
    windowMs: Config.limiter.duration * 60 * 1000,
    max: Config.limiter.max,
    message: "You're being rate limited.",
    standardHeaders: true,
    legacyHeaders: false,
});
