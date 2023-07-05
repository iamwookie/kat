!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="e39a0cf9-c10c-5143-9b76-23a8a760b0a2")}catch(e){}}();
import * as Config from '../../config.js';
import { Client, Events } from 'discord.js';
import { Logger } from './Logger.js';
import { PrismaClient } from '@prisma/client';
import { Redis } from '@upstash/redis';
import { Commander } from './commander/Commander.js';
import { Dispatcher } from './music/Dispatcher.js';
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
    dispatcher;
    cache;
    server;
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
        this.dispatcher = new Dispatcher(this);
        this.cache = new Cache(this);
        this.server = new Server(this);
        this.on(Events.Error, (err) => {
            this.logger.error(err);
        });
        if (process.env.NODE_ENV != 'production')
            this.on(Events.Debug, (msg) => this.logger.debug(msg));
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
//# debugId=e39a0cf9-c10c-5143-9b76-23a8a760b0a2
//# sourceMappingURL=Client.js.map
