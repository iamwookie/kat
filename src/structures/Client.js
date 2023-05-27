import * as Config from '../../config.js';
import { Client, Events, Collection, PermissionsBitField } from 'discord.js';
import { Logger } from './Logger.js';
import { PrismaClient } from '@prisma/client';
import { Commander } from './commander/Commander.js';
import { ShoukakuClient } from './music/ShoukakuClient.js';
import { Server } from './api/Server.js';
import { Cache } from './Cache.js';
import chalk from 'chalk';
export class KATClient extends Client {
    startTime = Date.now();
    permissions = new PermissionsBitField([
        // GENERAL
        PermissionsBitField.Flags.ViewChannel,
        // TEXT
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.EmbedLinks,
        PermissionsBitField.Flags.AttachFiles,
        PermissionsBitField.Flags.ReadMessageHistory,
        PermissionsBitField.Flags.UseExternalEmojis,
        PermissionsBitField.Flags.UseExternalStickers,
        PermissionsBitField.Flags.AddReactions,
        // VOICE
        PermissionsBitField.Flags.Connect,
        PermissionsBitField.Flags.Speak,
        PermissionsBitField.Flags.UseVAD,
    ]);
    config = Config;
    prefix = Config.bot.prefix;
    devPrefix = Config.bot.devPrefix;
    logger = new Logger(this);
    // Prisma causes an issue with circular references. Try fixing this later
    prisma = new PrismaClient({ log: ['warn', 'error'] });
    commander = new Commander(this);
    shoukaku = new ShoukakuClient(this);
    server = new Server(this);
    cache = new Cache(this);
    subscriptions = new Collection();
    constructor(options) {
        super(options);
        this.on(Events.Error, (err) => {
            this.logger.error(err);
        });
        if (process.env.NODE_ENV != 'production')
            this.on(Events.Debug, (msg) => {
                this.logger.debug(msg);
            });
    }
    async initialize() {
        try {
            await this.prisma.$connect();
            console.log(chalk.greenBright.bold.underline('>>> Prisma Initialized!'));
        }
        catch (err) {
            this.logger.fatal(err, 'Error Initializing', 'Prisma');
        }
        await this.commander.initialize();
        console.log(chalk.greenBright.bold.underline('>>> Commander Initialized!'));
    }
    isDev(user) {
        return this.config.devs.includes(user.id);
    }
}
