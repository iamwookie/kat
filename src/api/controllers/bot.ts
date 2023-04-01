import { KATClient as Client } from "@structures/index.js";
import { Request, Response } from "express";
import { formatTime, formatBytes } from "@src/utils/helpers.js";

import chalk from "chalk";

export function fetchStats(client: Client) {
    return async (req: Request, res: Response) => {
        try {
            const data = {
                uptime: formatTime(client.uptime ?? undefined),
                ram_usage: formatBytes(process.memoryUsage().heapUsed),
                ws_ping: client.ws.ping,
                guilds: client.guilds.cache.size,
                users: client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
            };

            return res.json(data);
        } catch (err) {
            client.logger.request(req, "error", err);
            console.error("Stats Controller (ERROR) >> Error Getting Stats");
            console.error(err);

            return res.status(500).send("Internal Server Error");
        }
    };
}

export function fetchInvite(client: Client) {
    return async (req: Request, res: Response) => {
        try {
            const url = new URL("https://discord.com/api/oauth2/authorize");
            url.searchParams.append("client_id", process.env.BOT_APP_ID!);
            url.searchParams.append("permissions", req.query.admin ? "8" : client.permissions?.bitfield.toString());
            url.searchParams.append("scope", "bot applications.commands");

            return res.redirect(url.toString());
        } catch (err) {
            client.logger.request(req, "error", err);
            console.error(chalk.red("Invite Controller (ERROR) >> Error Getting Invite"));
            console.error(err);

            return res.status(500).send("Internal Server Error");
        }
    };
}
