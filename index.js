// ------------------------------------
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="3b816003-53cd-5aca-830c-02d76a1c0ee1")}catch(e){}}();
import dotenv from 'dotenv';
dotenv.config();
// ------------------------------------
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
// ------------------------------------
import Sentry from '@sentry/node';
import '@sentry/tracing';
import { RewriteFrames } from '@sentry/integrations';
// ------------------------------------
import { KATClient as Client } from './src/structures/index.js';
import { GatewayIntentBits, ActivityType, Partials } from 'discord.js';
import chalk from 'chalk';
const __dirname = dirname(fileURLToPath(import.meta.url));
(async () => {
    console.log(chalk.magenta.bold.underline(`\n---- >>> App Loading...\n`));
    if (!fs.existsSync(path.join(__dirname, './logs')))
        fs.mkdirSync(path.join(__dirname, './logs'));
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
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.MessageContent,
        ],
        partials: [Partials.Message, Partials.Channel],
        presence: {
            status: 'online',
            activities: [
                {
                    name: `/help`,
                    type: ActivityType.Listening,
                },
            ],
        },
    });
    process.on('unhandledRejection', (err) => client.logger.uncaught(err));
    process.on('uncaughtException', (err) => client.logger.uncaught(err));
    await client.initialize();
    await client.login(process.env.DISCORD_TOKEN).catch((err) => client.logger.error(err));
})();
//# debugId=3b816003-53cd-5aca-830c-02d76a1c0ee1
//# sourceMappingURL=index.js.map
