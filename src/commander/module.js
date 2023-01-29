const Discord = require('discord.js');

class CommanderModule {
    constructor(commander, options) {
        this.commander = commander;
        this.options = options;

        Object.assign(this, module);

        if (this.events) {
            for (const event in this.commander.client._events) {
                if (event == 'error' || event == 'shardDisconnect' || event == 'msgCreate') continue;
                if (this.events.includes(event)) this.client.removeAllListeners(event);
            }
        }

        if (this.guilds) {
            for (const guildId of this.guilds) {
                if (!this.commander.client.guilds.cache.has(guildId)) this.commander.client.logger?.warn(`Commander >> Guild (${guildId}) Not Found For Module: ${this.name}`);

                const guild = this.commander.guilds.get(guildId) || {};
                guild.modules = guild.modules || new Discord.Collection();
                guild.modules.set(this.name, this);

                this.commander.guilds.set(guildId, guild);
            }
        }
    }

    async initialize(client) {
        try {
            await this.run(client);

            client.logger?.info(`Commander >> Loaded ${this.guilds ? 'Guild' : 'Global'} Module: ${this.name}`);
        } catch (err) {
            console.error(`Commander >> Failed to Load ${this.guilds ? 'Guild' : 'Global'} Module: ${this.name}`.red);
            console.error(err);

            client.logger?.error(err);
        }
    }
}

module.exports = CommanderModule;