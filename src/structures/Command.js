import { ChatInputCommandInteraction, Message, Collection } from "discord.js";
export class Command {
    client;
    commander;
    name;
    group;
    module;
    aliases;
    legacy;
    legacyAliases;
    description;
    hidden;
    disabled;
    cooldown;
    ephemeral;
    guilds;
    users;
    cooldowns = new Collection();
    constructor(client, commander) {
        this.client = client;
        this.commander = commander;
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
            return interaction.options.data.map((option) => (typeof option.value == "string" ? option.value.split(/ +/) : option.options)).flat();
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
            return interaction.channel.send(content);
        }
    }
    get usage() {
        const aliases = this.aliases ? ", " + this.aliases.map((alias) => this.client.prefix + alias).join(", ") : "";
        return `${this.client.prefix}${this.name}${aliases}${this.description?.format ? " " + this.description.format : ""}`;
    }
}
