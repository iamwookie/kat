// ------------------------------------
import dotenv from "dotenv";
dotenv.config();
// ------------------------------------
import chalk from "chalk";
// ------------------------------------
import Sentry from "@sentry/node";
import "@sentry/tracing";
import { RewriteFrames } from "@sentry/integrations";
// ------------------------------------
import { Client, GatewayIntentBits, ActivityType, Events } from "discord.js";
// ------------------------------------
import Config  from "@configs/bot.json" assert { type: "json" };
// ------------------------------------
// const Commander = require("@commander");
import { Commander, CommanderLogger, CommanderDatabase } from "@commander/index.js";
import CreateServer from "@api/server.js";
import { Express } from "express";
// const TwitchManager = require("@lib/twitch/manager");
// ------------------------------------
const now = Date.now();
// ------------------------------------
declare module "discord.js" {
    interface Client {
        devId: string;
        prefix: string;
        logger: CommanderLogger;
        database?: CommanderDatabase;
        commander?: Commander;
        server?: Express;
    }
}

console.log(chalk.magenta.bold.underline(`>>> App Loading...\n`));

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    maxBreadcrumbs: 50,
    integrations: [
        new RewriteFrames({
            root: global.__dirname,
        }),
    ],
});

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
    presence: {
        status: "online",
        activities: [
            {
                name: "/help",
                type: ActivityType.Listening,
            },
        ],
    },
});

client.devId = Config.devId;
client.prefix = Config.prefix;

client.logger = new CommanderLogger(client);

client.once(Events.ClientReady, async (client) => {
    // ------------------------------------
    client.database = await CommanderDatabase.initialize(client);
    client.commander = await Commander.initialize(client);
    client.server = (await CreateServer(client).catch((err) => { client.logger.error(err) })) as Express;
    // client.twitch = await TwitchManager.initialize(client);
    // ------------------------------------
    console.log(chalk.magenta.bold.underline(`\n>>> App Online, Client: ${client.user.tag} (${client.user.id}) [Guilds: ${client.guilds.cache.size}]`));
    console.log(chalk.magenta.bold.underline(`>>> App Loaded In: ${Date.now() - now}ms\n`));
});

client.on(Events.Error, err => { client.logger.error(err) });

if (process.env.NODE_ENV != "production") client.on(Events.Debug, msg => { client.logger.debug(msg) });

client.login(process.env.BOT_TOKEN);

export default client;
