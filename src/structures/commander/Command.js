!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="4116dc34-bf87-5106-a478-56823d54f058")}catch(e){}}();
import { Module } from './Module.js';
import { SlashCommandBuilder, Collection } from 'discord.js';
export class Command {
    client;
    commander;
    name;
    module;
    // Remove this when implementing slash commands.
    aliases;
    description;
    cooldown;
    ephemeral;
    // Change the name of this, pretty shit.
    allowDM;
    users;
    hidden;
    disabled;
    cooldowns;
    constructor(client, commander, options) {
        this.client = client;
        this.commander = commander;
        this.name = options.name;
        this.aliases = options.aliases;
        this.description = options.description;
        this.cooldown = options.cooldown;
        this.ephemeral = options.ephemeral;
        this.allowDM = options.allowDM;
        this.users = options.users;
        this.hidden = options.hidden;
        this.disabled = options.disabled;
        this.cooldowns = new Collection();
        if (options.module)
            this.module = this.commander.modules.get(options.module) ?? new Module(this.client, commander, { name: options.module });
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
        return `${prefix}${this.name}${this.description?.format ? ' ' + this.description.format : ''}`;
    }
}
//# debugId=4116dc34-bf87-5106-a478-56823d54f058
//# sourceMappingURL=Command.js.map
