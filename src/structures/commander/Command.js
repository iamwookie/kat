import { SlashCommandBuilder, Collection } from 'discord.js';
export class Command {
    client;
    commander;
    name;
    module;
    legacy;
    aliases;
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
        this.legacy = options.legacy;
        this.aliases = options.aliases;
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
    usage(prefix) {
        const aliases = this.aliases ? ', ' + this.aliases.map((alias) => prefix + alias).join(', ') : '';
        return `${prefix}${this.name}${aliases}${this.description?.format ? ' ' + this.description.format : ''}`;
    }
}
