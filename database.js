const Discord = require("discord.js");
const Commander = require('./commander');

class CommanderDatabase {
    constructor(client) {
        this.client = client;
        this.guilds = new Discord.Collection();
    }

    static async initialize(client) {
        try {
            let database = new CommanderDatabase(client);
            database.redis = client.redis;
            await database.load();
            console.log('>>> Database Initialized'.brightGreen.bold.underline);

            return database;
        } catch (err) {
            console.log('CommanderDatabase (ERROR) >> Error Initializing'.red);
            console.log(err);
            Commander.handleError(this.client, err);

            return false;
        }
    }

    async load() {
        try {
            let guilds = await this.redis.hGetAll('guilds');

            if (Object.keys(guilds).length) {
                for (const guild in guilds) {
                    this.guilds.set(guild, JSON.parse(guilds[guild]));
                }
            }
            console.log('CommanderDatabase >> Data Loaded'.brightGreen);
            
            return true;
        } catch (err) {
            console.log('CommanderDatabase (ERROR) >> Error Loading'.red);
            console.log(err);
            Commander.handleError(this.client, err);

            return false;
        }
    }

    async set(guild, key, value) {
        if (!this.guilds) await this.load();

        try {
            let data = this.guilds.get(guild) || {};
            data[key] = value;
            await this.redis.hSet('guilds', guild, JSON.stringify(data));
            await this.load();
            console.log('CommanderDatabase >> Value Set'.brightGreen);

            return true;
        } catch (err) {
            console.log('CommanderDatabase (ERROR) >> Error Setting Value'.red);
            console.log(err);
            Commander.handleError(this.client, err);

            return false
        }
    }

    async get(guild, key) {
        if (!this.guilds) await this.load();

        let data = this.guilds.get(guild) || {};
        return data[key];
    }
}

module.exports = CommanderDatabase;