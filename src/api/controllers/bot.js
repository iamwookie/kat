import { formatBytes } from "../../utils/helpers.js";
import chalk from "chalk";
export function fetchStats(client) {
    return async (req, res) => {
        try {
            const data = {
                uptime: client.uptime ?? 0,
                ram_usage: formatBytes(process.memoryUsage().heapUsed),
                ws_ping: client.ws.ping,
                guilds: client.guilds.cache.size,
                users: client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
            };
            return res.json(data);
        }
        catch (err) {
            client.logger.error(err);
            console.error("Stats Controller (ERROR) >> Error Getting Stats");
            console.error(err);
            return res.status(500).send("Internal Server Error");
        }
    };
}
export function fetchInvite(client) {
    return async (req, res) => {
        try {
            const url = new URL("https://discord.com/api/oauth2/authorize");
            url.searchParams.append("client_id", process.env.DISCORD_APP_ID);
            url.searchParams.append("permissions", req.query.admin ? "8" : client.permissions?.bitfield.toString());
            url.searchParams.append("scope", "bot applications.commands");
            return res.redirect(url.toString());
        }
        catch (err) {
            client.logger.error(err);
            console.error(chalk.red("Invite Controller (ERROR) >> Error Getting Invite"));
            console.error(err);
            return res.status(500).send("Internal Server Error");
        }
    };
}