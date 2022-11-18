const Discord = require('discord.js');

class CommanderCommand {
    constructor(object, commander) {
        this.commander = commander;
        this.object = object;

        for (const key in object) {
            this[key] = object[key];
        }
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
                if (!this.commander.client.guilds.cache.has(guildId)) console.warn(`Commander (WARNING) >> Guild (${guildId}) Not Found For Command: ${this.name}`.yellow);

                let guild = this.commander.guilds.get(guildId) || {};
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

    getCooldown(guild, user) {
        const now = Date.now();

        if (!this.cooldown) return false;

        let cooldown = this.cooldown * 1000;
        if (!this.commander.cooldowns.has(guild?.id || 'dm')) this.commander.cooldowns.set(guild?.id || 'dm', new Discord.Collection());

        let cooldowns = this.commander.cooldowns.get(guild?.id || 'dm');
        if (!cooldowns.has(user.id)) cooldowns.set(user.id, new Discord.Collection());

        let usages = cooldowns.get(user.id);
        if (usages.has(this.name)) {
            let expire = usages.get(this.name) + cooldown;
            if (now < expire) return ((expire - now) / 1000).toFixed();
        }

        usages.set(this.name, now);

        setTimeout(() => usages.delete(this.name), cooldown);

        return false;
    }
}

module.exports = CommanderCommand;