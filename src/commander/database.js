const Discord = require("discord.js");
const Commander = require('@commander');
const redis = require('@libs/redis');

class CommanderDatabase {
    constructor(client) {
        this.client = client;
        this.prefix = 'cat:';
        
        this.guilds = new Discord.Collection();
        this.access = new Discord.Collection();
    }

    static async initialize(client) {
        try {
            let database = new CommanderDatabase(client);
            database.redis = await redis();
            await database.#load();
            console.log('>>> Database Initialized'.brightGreen.bold.underline);

            return database;
        } catch (err) {
            console.error('CommanderDatabase (ERROR) >> Error Initializing'.red);
            console.error(err);
            Commander.handleError(this.client, err);
        }
    }

    // Private

    async #load() {
        try {
            let guilds = await this.redis.hGetAll(this.withPrefix('guilds'));

            this.guilds.clear();

            if (Object.keys(guilds).length) {
                for (const guild in guilds) {
                    this.guilds.set(guild, JSON.parse(guilds[guild]));
                }
            }

            let access = await this.redis.hGetAll(this.withPrefix('access'));

            this.access.clear();

            if (Object.keys(access).length) {
                for (const command in access) {
                    this.access.set(command, JSON.parse(access[command]));
                }
            }

            console.log('CommanderDatabase >> Data Loaded'.brightGreen);

            return true;
        } catch (err) {
            console.error('CommanderDatabase (ERROR) >> Error Loading (SHUTDOWN)'.red);
            console.error(err);
            this.loadLocked = false;
            Commander.handleError(this.client, err, true);
        }
    }

    // Public

    async get(guild, key) {
        if (!this.guilds) await this.load();

        let data = this.guilds.get(guild) || {};
        return data[key];
    }

    async set(guild, key, value) {
        if (!this.guilds) await this.load();

        try {
            let data = this.guilds.get(guild) || {};
            data[key] = value;
            await this.redis.hSet(this.withPrefix('guilds'), guild, JSON.stringify(data));
            await this.load();
            console.log('CommanderDatabase >> Value Set'.brightGreen);

            return true;
        } catch (err) {
            console.error('CommanderDatabase (ERROR) >> Error Setting Value'.red);
            console.error(err);
            Commander.handleError(this.client, err);

            return false;
        }
    }

    async delete(guild, key) {
        if (!this.guilds) await this.load();

        try {
            let data = this.guilds.get(guild) || {};
            delete data[key];

            if (Object.keys(data).length) {
                await this.redis.hSet(this.withPrefix('guilds'), guild, JSON.stringify(data));
            } else {
                await this.redis.hDel(this.withPrefix('guilds'), guild);
            }

            await this.load();
            console.log('CommanderDatabase >> Value Deleted'.brightGreen);

            return true;
        } catch (err) {
            console.error('CommanderDatabase (ERROR) >> Error Deleting Value'.red);
            console.error(err);
            Commander.handleError(this.client, err);

            return false;
        }
    }

    withPrefix(key) {
        return this.prefix + key;
    }

    // Access

    async getAccess(command) {
        if (!this.access) await this.load();

        const data = this.access.get(command) || {};
        return data;
    }

    async setAccess(command, data) {
        try {
            if (!data.guilds?.length && !data.users?.length) {
                await this.redis.hDel(this.withPrefix('access'), command);
            } else {
                await this.redis.hSet(this.withPrefix('access'), command, JSON.stringify(data));
            }

            await this.load();
        } catch (err) {
            console.error('CommanderDatabase (ERROR) >> Error Setting Value'.red);
            console.error(err);
            Commander.handleError(this.client, err);
        }
    }

    // Twitch

    async getTwitch() {
        if (!this.guilds) await this.load();

        let res = [];

        for (const [_, data] of this.guilds) {
            if (data.twitch) res.push(data.twitch);
        }

        return res;
    }
}

module.exports = CommanderDatabase;