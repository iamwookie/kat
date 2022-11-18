const Discord = require('discord.js');

class CommanderModule {
    constructor(module, commander) {
        this.commander = commander;
        this.module = module;

        for (const key in module) {
            this[key] = module[key];
        }

        if (this.events) {
            for (const event in this.commander.client._events) {
                if (event == 'error' || event == 'shardDisconnect' || event == 'msgCreate') continue;
                if (this.events.includes(event)) this.client.removeAllListeners(event);
            }
        }

        if (this.guilds) {
            for (const guildId of this.guilds) {
                if (!this.commander.client.guilds.cache.has(guildId)) console.warn(`Commander (WARNING) >> Guild (${guildId}) Not Found For Module: ${this.name}`.yellow);

                let guild = this.commander.guilds.get(guildId) || {};
                guild.modules = guild.modules || new Discord.Collection();
                guild.modules.set(this.name, this);

                this.commander.guilds.set(guildId, guild);
            }
        }
    }

    async initialize(client) {
        try {
            await this.run(client);
            console.log(`Commander >> Loaded ${this.guilds ? 'Guild' : 'Global'} Module: ${this.name}`.brightGreen);
        } catch (err) {
            console.error(`Commander >> Failed to Load ${this.guilds ? 'Guild' : 'Global'} Module: ${this.name}`.red);
            console.error(err);
            this.commander.handleError(client, err);
        }
    }
}

module.exports = CommanderModule;