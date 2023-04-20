import { Collection } from "discord.js";
import { createClient } from "redis";
import chalk from "chalk";
export class Database {
    client;
    prefix = "cat:";
    redis;
    guilds = new Collection();
    access = new Collection();
    constructor(client) {
        this.client = client;
    }
    async initialize() {
        await this.connect();
        await this.load();
    }
    async connect() {
        try {
            this.redis = createClient({
                url: process.env.REDIS_URL,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 3)
                            return new Error(chalk.red("Redis >> Failed To Connect"));
                        return Math.min(retries * 100, 3000);
                    },
                },
            });
            this.redis.on("connect", () => this.client.logger.info("Redis >> Connected"));
            this.redis.on("end", () => this.client.logger.info("Redis >> Disconnected"));
            this.redis.on("error", (err) => {
                this.client.logger.error(err);
                console.error(chalk.red("Redis >> Error"));
                console.error(err);
            });
            await this.redis.connect();
        }
        catch (err) {
            this.client.logger.error(err);
            console.error(chalk.red("CommanderDatabase (ERROR) >> Error Connecting"));
            console.error(err);
        }
    }
    async load() {
        try {
            const guilds = await this.redis.hGetAll(this.withPrefix("guilds"));
            this.guilds.clear();
            if (Object.keys(guilds).length) {
                for (const guild in guilds) {
                    this.guilds.set(guild, JSON.parse(guilds[guild]));
                }
            }
            this.client.logger.info("CommanderDatabase >> Data Loaded");
            return true;
        }
        catch (err) {
            this.client.logger.error(err);
            console.error(chalk.red("CommanderDatabase (ERROR) >> Error Loading Data"));
            console.error(err);
        }
    }
    async get(guild, key) {
        if (!this.guilds)
            await this.load();
        const data = this.guilds.get(guild) || {};
        return data[key];
    }
    async set(guild, key, value) {
        if (!this.guilds)
            await this.load();
        try {
            const data = this.guilds.get(guild) || {};
            data[key] = value;
            await this.redis.hSet(this.withPrefix("guilds"), guild, JSON.stringify(data));
            await this.load();
            console.log(chalk.greenBright("CommanderDatabase >> Value Set"));
            return true;
        }
        catch (err) {
            this.client.logger.error(err);
            console.error(chalk.red("CommanderDatabase (ERROR) >> Error Setting Value"));
            console.error(err);
            return false;
        }
    }
    async delete(guild, key) {
        if (!this.guilds)
            await this.load();
        try {
            const data = this.guilds.get(guild) || {};
            delete data[key];
            if (Object.keys(data).length) {
                await this.redis.hSet(this.withPrefix("guilds"), guild, JSON.stringify(data));
            }
            else {
                await this.redis.hDel(this.withPrefix("guilds"), guild);
            }
            await this.load();
            console.log(chalk.greenBright("CommanderDatabase >> Value Deleted"));
            return true;
        }
        catch (err) {
            this.client.logger.error(err);
            console.error(chalk.red("CommanderDatabase (ERROR) >> Error Deleting Value"));
            console.error(err);
            return false;
        }
    }
    withPrefix(key) {
        return this.prefix + key;
    }
    // Access
    async getAccess(command) {
        if (!this.access)
            await this.load();
        const data = this.access.get(command) || {};
        return data;
    }
    async setAccess(command, data) {
        try {
            if (!data.guilds?.length && !data.users?.length) {
                await this.redis.hDel(this.withPrefix("access"), command);
            }
            else {
                await this.redis.hSet(this.withPrefix("access"), command, JSON.stringify(data));
            }
            await this.load();
        }
        catch (err) {
            this.client.logger.error(err);
            console.error(chalk.red("CommanderDatabase (ERROR) >> Error Setting Value"));
            console.error(err);
        }
    }
}