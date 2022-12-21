const Discord = require('discord.js');

class CommanderCommand {
    constructor(commander, options) {
        this.commander = commander;

        Object.assign(this, options);

        if (!this.name) throw new Error('CommanderCommand (ERROR) >> Command Missing Name');
        if (!this.group) throw new Error('CommanderCommand (ERROR) >> Command Missing Group');

        if (this.cooldown) this.cooldowns = new Discord.Collection();
    }

    async initialize() {
        if (this.aliases) {
            for (const alias of this.aliases) {
                this.commander.aliases.set(alias, this.name);
            }
        }

        if (this.guilds || this.users) {
            if (this.commander.client.database) {
                const data = await this.commander.client.database.getAccess(this.name);
                if (data.guilds && this.guilds) this.guilds.push(...data.guilds);
                if (data.users && this.users) this.users.push(...data.users);
            }

            if (this.users) this.users.push(this.commander.client.dev);
        }

        if (this.guilds) {
            for (const guildId of this.guilds) {
                if (!this.commander.client.guilds.cache.has(guildId)) this.commander.client.logger?.warn(`Commander >> Guild (${guildId}) Not Found For Command: ${this.name}`);

                const guild = this.commander.guilds.get(guildId) || {};
                guild.commands = guild.commands || new Discord.Collection();
                guild.commands.set(this.name, this);

                this.commander.guilds.set(guildId, guild);
            }
        } else {
            this.commander.global.set(this.name, this);
        }

        if (!this.commander.groups.has(this.group)) this.commander.groups.set(this.group, new Discord.Collection());

        this.commander.groups.get(this.group).set(this.name, this);
    }

    applyCooldown(guild, user) {
        if (!this.cooldown || !this.cooldowns) return;

        const now = Date.now();
        const cooldown = this.cooldown * 1000;

        if (!this.cooldowns.has(guild?.id || 'dm')) this.cooldowns.set(guild?.id || 'dm', new Discord.Collection());

        const cooldowns = this.cooldowns.get(guild?.id || 'dm');

        if (!cooldowns.has(user.id)) cooldowns.set(user.id, now + cooldown);

        setTimeout(() => cooldowns.delete(user.id), cooldown);
    }
}

module.exports = CommanderCommand;