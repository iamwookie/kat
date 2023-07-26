import { KATClient as Client } from '../Client.js';
import { Commander } from './Commander.js';
import { Module } from './Module.js';
import { SlashCommandBuilder, ChatInputCommandInteraction, User, Collection, Snowflake } from 'discord.js';

interface CommandOptions {
    name: string;
    module: string;
    aliases?: string[];
    legacy?: boolean;
    description?: {
        content?: string;
        format?: string;
    };
    cooldown?: number;
    ephemeral?: boolean;
    allowDM?: boolean;
    users?: Snowflake[];
    hidden?: boolean;
    disabled?: boolean;
}

export abstract class Command {
    public name: string;
    public module: Module;
    // Remove this when implementing slash commands.
    public aliases?: string[];
    public description?: {
        content?: string;
        format?: string;
    };
    public cooldown?: number;
    public ephemeral?: boolean;
    // Change the name of this, pretty shit.
    public allowDM?: boolean;
    public users?: Snowflake[];
    public hidden?: boolean;
    public disabled?: boolean;
    public cooldowns: Collection<Snowflake, number>;

    abstract execute(interaction: ChatInputCommandInteraction): any;

    constructor(public client: Client, public commander: Commander, options: CommandOptions) {
        this.name = options.name;
        this.aliases = options.aliases;
        this.description = options.description;
        this.cooldown = options.cooldown;
        this.ephemeral = options.ephemeral;
        this.allowDM = options.allowDM;
        this.users = options.users;
        this.hidden = options.hidden;
        this.disabled = options.disabled;
        this.cooldowns = new Collection<Snowflake, number>();

        if (options.module) this.module = this.commander.modules.get(options.module) ?? new Module(this.client, commander, { name: options.module });
    }

    data(): SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'> {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content ?? '')
            .setDMPermission(this.allowDM);
    }

    applyCooldown(user: User): void {
        if (!this.cooldown) return;

        const now = Date.now();
        const cooldown = this.cooldown * 1000;

        if (!this.cooldowns.has(user.id)) this.cooldowns?.set(user.id, now + cooldown);

        setTimeout(() => this.cooldowns?.delete(user.id), cooldown);
    }

    usage(prefix: string) {
        return `${prefix}${this.name}${this.description?.format ? ' ' + this.description.format : ''}`;
    }
}
