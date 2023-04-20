// ------------------------------------
import dotenv from "dotenv";
dotenv.config();
// ------------------------------------
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
// ------------------------------------
import Sentry from "@sentry/node";
import "@sentry/tracing";
import { RewriteFrames } from "@sentry/integrations";
// ------------------------------------
import { KATClient as Client } from "@structures/index.js";
import { GatewayIntentBits, ActivityType } from "discord.js";
import { bot as config } from "@config";

import { ActionEmbed } from "@utils/embeds/action.js";

import chalk from "chalk";

const __dirname = dirname(fileURLToPath(import.meta.url));

(async () => {
    console.log(chalk.magenta.bold.underline(`\n---- >>> App Loading...\n`));

    if (!fs.existsSync(path.join(__dirname, "./logs"))) fs.mkdirSync(path.join(__dirname, "./logs"));

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
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
        presence: {
            status: "online",
            activities: [
                {
                    name: `${config.prefix}help | ${config.legacyPrefix}help`,
                    type: ActivityType.Listening,
                },
            ],
        },
    });

    process.on("unhandledRejection", (err) => {
        client.logger.uncaught(err);
    });

    process.on("uncaughtException", (err) => {
        client.logger.uncaught(err);
    });

    process.on("beforeExit", async () => {
        if (!client.subscriptions.size) return;

        console.log("-> Warning Subscriptions...");

        for (const subscription of client.subscriptions.values()) {
            if (!subscription.active) continue;

            const channel = subscription.textChannel;
            if (!channel) continue;

            try {
                await channel.send({ embeds: [new ActionEmbed("warn").setText("The bot is restarting, replay your track after a few seconds!")] });
                console.log(`-> Warned ${subscription.guild.name} (${subscription.guild.id})`);
            } catch (err) {
                console.error(`-> Failed To Warn ${subscription.guild.name} (${subscription.guild.id}): ${err instanceof Error ? err.message : err}`);
            }
        }

        console.log("-> Warned All Subscriptions");
    });

    await client.initialize();
    await client.login(process.env.DISCORD_TOKEN).catch((err) => {
        client.logger.error(err);
    });
})();
