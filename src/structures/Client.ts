import * as Config from '@config';
import { Client, ClientOptions, Events, PermissionsBitField, User } from 'discord.js';
import { Logger } from './Logger.js';
import { PrismaClient } from '@prisma/client';
import { Redis } from '@upstash/redis';
import { Commander } from './commander/Commander.js';
import { Dispatcher } from './music/Dispatcher.js';
import { Server } from '@structures/api/Server.js';
import { Cache } from './Cache.js';

export class KATClient extends Client {
    public startTime: number;
    // Make a type for config later
    public config: typeof Config;
    public prefix: string;
    public devPrefix: string;
    public permissions: PermissionsBitField;
    public logger: Logger;
    public prisma: PrismaClient;
    public redis: Redis;
    public commander: Commander;
    public dispatcher: Dispatcher;
    public cache: Cache;
    public server: Server;

    constructor(options: ClientOptions) {
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

        if (process.env.NODE_ENV != 'production') this.on(Events.Debug, (msg) => this.logger.debug(msg));
    }

    async initialize() {
        try {
            await this.prisma.$connect();
            this.logger.status('>>>> Prisma Initialized!');
        } catch (err) {
            this.logger.fatal(err, 'Error Initializing', 'Prisma');
        }

        await this.commander.initialize();
    }

    isDev(user: User) {
        return this.config.devs.includes(user.id);
    }
}
