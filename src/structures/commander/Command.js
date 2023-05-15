import { SlashCommandBuilder, Collection } from 'discord.js';
export class Command {
    client;
    commander;
    name;
    module;
    aliases;
    legacy;
    legacyAliases;
    description;
    cooldown;
    ephemeral;
    allowDM;
    users;
    hidden;
    disabled;
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
        this.cooldown = options.cooldown;
        this.ephemeral = options.ephemeral;
        this.allowDM = options.allowDM;
        this.users = options.users;
        this.hidden = options.hidden;
        this.disabled = options.disabled;
    }
    data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content ?? '')
            .setDMPermission(this.allowDM);
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
    get usage() {
        const aliases = this.aliases ? ', ' + this.aliases.map((alias) => this.client.prefix + alias).join(', ') : '';
        return `${this.client.prefix}${this.name}${aliases}${this.description?.format ? ' ' + this.description.format : ''}`;
    }
}
