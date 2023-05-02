import * as Config from '@config';
import { Client, ClientOptions, Events, Collection, PermissionsBitField, Snowflake, User } from 'discord.js';
import { Logger } from './Logger.js';
import { PrismaClient } from '@prisma/client';
import { Commander } from './commander/Commander.js';
import { ShoukakuClient } from './music/ShoukakuClient.js';
import { Server } from '@structures/api/Server.js';
import { Cache } from './Cache.js';
import { Subscription as MusicSubscription } from './music/Subscription.js';

import chalk from 'chalk';

export class KATClient extends Client {
    public startTime = Date.now();
    public permissions = new PermissionsBitField([
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
    public config = Config;
    public devId = Config.bot.devId;
    public prefix = Config.bot.prefix;
    public devPrefix = Config.bot.devPrefix;
    public legacyPrefix = Config.bot.legacyPrefix;
    public logger = new Logger(this);
    // Prisma causes an issue with circular references. Try fixing this later
    public prisma = new PrismaClient({ log: ['warn', 'error'] });
    public commander = new Commander(this);
    public shoukaku = new ShoukakuClient(this);
    public server = new Server(this);
    public cache = new Cache(this);
    public subscriptions = new Collection<Snowflake, MusicSubscription>();

    constructor(options: ClientOptions) {
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
        } catch (err) {
            this.logger.error(err, 'Error Initializing', 'Prisma');
        }

        await this.commander.initialize();
        console.log(chalk.greenBright.bold.underline('>>> Commander Initialized!'));
    }

    isDev(user: User) {
        return this.devId == user.id;
    }
}
