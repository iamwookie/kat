import { ChatInputCommandInteraction, Message, Collection, } from 'discord.js';
export class Command {
    client;
    commander;
    name;
    module;
    aliases;
    legacy;
    legacyAliases;
    description;
    hidden;
    disabled;
    cooldown;
    ephemeral;
    users;
    cooldowns = new Collection();
    constructor(client, commander, options) {
        this.client = client;
        this.commander = commander;
        this.name = options.name;
        this.module = options.module;
        this.aliases = options.aliases;
        this.legacy = options.legacy;
        this.legacyAliases = options.legacyAliases;
        this.description = options.description;
        this.hidden = options.hidden;
        this.disabled = options.disabled;
        this.cooldown = options.cooldown;
        this.ephemeral = options.ephemeral;
        this.users = options.users;
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
        else {
            throw new Error('Invalid interaction.');
        }
    }
    getArgs(interaction) {
        if (interaction instanceof ChatInputCommandInteraction) {
            return interaction.options.data.map((option) => (typeof option.value == 'string' ? option.value.split(/ +/) : option.options)).flat();
        }
        else if (interaction instanceof Message) {
            return interaction.content.split(/ +/).slice(1);
        }
        else {
            return [];
        }
    }
    reply(interaction, content) {
        if (interaction instanceof ChatInputCommandInteraction) {
            return interaction.editReply(content);
        }
        else if (interaction instanceof Message) {
            return interaction.channel.send(content);
        }
        else {
            return Promise.reject('Invalid interaction.');
        }
    }
    edit(interaction, editable, content) {
        if (interaction instanceof ChatInputCommandInteraction) {
            return interaction.editReply(content);
        }
        else if (interaction instanceof Message) {
            return editable.edit(content);
        }
        else {
            return Promise.reject('Invalid interaction.');
        }
    }
    get usage() {
        const aliases = this.aliases ? ', ' + this.aliases.map((alias) => this.client.prefix + alias).join(', ') : '';
        return `${this.client.prefix}${this.name}${aliases}${this.description?.format ? ' ' + this.description.format : ''}`;
    }
}
