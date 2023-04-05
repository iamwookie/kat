// ------------------------------------
import dotenv from "dotenv";
dotenv.config();
// ------------------------------------
import { KATClient as Client } from "./src/structures/index.js";
import { GatewayIntentBits, ActivityType } from "discord.js";
// ------------------------------------
import Sentry from "@sentry/node";
import "@sentry/tracing";
import { RewriteFrames } from "@sentry/integrations";
// ------------------------------------
import chalk from "chalk";

(async () => {
    console.log(chalk.magenta.bold.underline(`\n>>> App Loading...\n`));

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
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ],
        presence: {
            status: "online",
            activities: [
                {
                    name: "/help | .help",
                    type: ActivityType.Listening,
                },
            ],
        },
    });

    await client.initialize();
    await client.login(process.env.BOT_TOKEN).catch(err => { client.logger.error(err) });

    return client;
})();
