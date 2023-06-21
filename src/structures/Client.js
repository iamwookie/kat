import * as Config from '../../config.js';
import { Client, Events, Collection } from 'discord.js';
import { Logger } from './Logger.js';
import { PrismaClient } from '@prisma/client';
import { Redis } from '@upstash/redis';
import { Commander } from './commander/Commander.js';
import { ShoukakuClient } from './music/ShoukakuClient.js';
import { Server } from './api/Server.js';
import { Cache } from './Cache.js';
export class KATClient extends Client {
    startTime;
    // Make a type for config later
    config;
    prefix;
    devPrefix;
    permissions;
    logger;
    prisma;
    redis;
    commander;
    shoukaku;
    cache;
    server;
    subscriptions;
    constructor(options) {
        super(options);
        this.startTime = Date.now();
        this.config = Config;
        this.prefix = Config.bot.prefix;
        this.devPrefix = Config.bot.devPrefix;
        this.permissions = Config.bot.permissions;
        this.logger = new Logger(this);
        // Prisma causes an issue with circular references. Try fixing this later
        this.prisma = new PrismaClient({ log: ['warn', 'error'] });
        this.redis = Redis.fromEnv();
        this.commander = new Commander(this);
        this.shoukaku = new ShoukakuClient(this);
        this.cache = new Cache(this);
        this.server = new Server(this);
        this.subscriptions = new Collection();
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
            this.logger.status('>>>> Prisma Initialized!');
        }
        catch (err) {
            this.logger.fatal(err, 'Error Initializing', 'Prisma');
        }
        await this.commander.initialize();
    }
    isDev(user) {
        return this.config.devs.includes(user.id);
    }
}
