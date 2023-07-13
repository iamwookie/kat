!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="e1e0fc85-6c73-564c-b18a-d574eff9af61")}catch(e){}}();
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
        this.permissions = Config.bot.permissions;
        this.logger = new Logger(this);
        this.prisma = new PrismaClient({ log: ['warn', 'error'] });
        this.redis = Redis.fromEnv();
        this.commander = new Commander(this);
        this.dispatcher = new Dispatcher(this);
        this.cache = new Cache(this);
        this.server = new Server(this);
        // @ts-expect-error - Error method returns a string but isn't necessary.
        this.on(Events.Error, (err) => this.logger.error(err, 'An Error Has Occured', 'Client'));
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
//# debugId=e1e0fc85-6c73-564c-b18a-d574eff9af61
//# sourceMappingURL=Client.js.map
