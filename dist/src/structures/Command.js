import { ChatInputCommandInteraction, Message, Collection } from "discord.js";
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
    applyCooldown(user) {
        if (!this.cooldown)
            return;
        const now = Date.now();
        const cooldown = this.cooldown * 1000;
        if (!this.cooldowns.has(user.id))
            this.cooldowns?.set(user.id, now + cooldown);
        setTimeout(() => this.cooldowns?.delete(user.id), cooldown);
    }
    getAuthor(interaction) {
        if (interaction instanceof ChatInputCommandInteraction) {
            return interaction.user;
        }
        else if (interaction instanceof Message) {
            return interaction.author;
        }
    }
    getArgs(interaction) {
        if (interaction instanceof ChatInputCommandInteraction) {
            return interaction.options.data.map((option) => typeof option.value == "string" ? option.value.split(/ +/) : option.value).flat();
            ;
        }
        else if (interaction instanceof Message) {
            return interaction.content.split(/ +/).slice(1);
        }
        return [];
    }
    reply(interaction, content) {
        if (interaction instanceof ChatInputCommandInteraction) {
            return interaction.editReply(content);
        }
        else if (interaction instanceof Message) {
            return interaction.reply(content);
        }
    }
}
