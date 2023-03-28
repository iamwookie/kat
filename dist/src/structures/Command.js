import { Collection } from "discord.js";
export class Command {
    commander;
    name;
    group;
    aliases;
    description;
    hidden;
    disabled;
    cooldown;
    ephemeral;
    guilds;
    users;
    cooldowns = new Collection();
    constructor(commander) {
        this.commander = commander;
        this.commander = commander;
    }
    initialize() {
        if (this.aliases) {
            for (const alias of this.aliases) {
                this.commander.aliases.set(alias, this.name);
            }
        }
        if (this.users)
            this.users.push(this.commander.client.devId);
        if (this.guilds) {
            for (const guildId of this.guilds) {
                const guild = this.commander.guilds.get(guildId) || {};
                guild.commands = guild.commands || new Collection();
                guild.commands.set(this.name, this);
                this.commander.guilds.set(guildId, guild);
            }
        }
        else {
            this.commander.global.set(this.name, this);
        }
        if (!this.commander.groups.has(this.group))
            this.commander.groups.set(this.group, new Collection());
        this.commander.groups.get(this.group)?.set(this.name, this);
    }
    applyCooldown(guild, user) {
        if (!this.cooldown)
            return;
        const now = Date.now();
        const cooldown = this.cooldown * 1000;
        if (!this.cooldowns.has(guild?.id || "dm"))
            this.cooldowns.set(guild?.id || "dm", new Collection());
        const cooldowns = this.cooldowns.get(guild?.id || "dm");
        if (!cooldowns?.has(user.id))
            cooldowns?.set(user.id, now + cooldown);
        setTimeout(() => cooldowns?.delete(user.id), cooldown);
    }
}
