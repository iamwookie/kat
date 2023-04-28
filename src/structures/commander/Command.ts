import { KATClient as Client } from '../Client.js';
import { Commander } from './Commander.js';
import { Module } from './Module.js';
import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    User,
    Message,
    Collection,
    Snowflake,
    InteractionEditReplyOptions,
    MessagePayload,
    MessageEditOptions,
    MessageCreateOptions,
} from 'discord.js';

interface CommandOptions<T extends boolean = boolean> {
    name: string;
    module: T extends true ? Module : T extends false ? string : never;
    aliases?: string[];

    legacy?: boolean;
    legacyAliases?: string[];

    description?: {
        content?: string;
        format?: string;
    };

    hidden?: boolean;
    disabled?: boolean;
    cooldown?: number;
    ephemeral?: boolean;

    users?: Snowflake[];
}

export abstract class Command<T extends boolean = boolean> implements CommandOptions<T> {
    public name: string;
    public module: T extends true ? Module : T extends false ? string : never;
    public aliases?: string[];

    public legacy?: boolean;
    public legacyAliases?: string[];

    public description?: {
        content?: string;
        format?: string;
    };

    public hidden?: boolean;
    public disabled?: boolean;
    public cooldown?: number;
    public ephemeral?: boolean;

    public users?: Snowflake[];

    public cooldowns: Collection<Snowflake, number> = new Collection();

    abstract data(): SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
    abstract execute(interaction: ChatInputCommandInteraction<'cached' | 'raw'> | Message<true>): Promise<any>;

    constructor(public client: Client, public commander: Commander, options: CommandOptions<T>) {
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

    applyCooldown(user: User): void {
        if (!this.cooldown) return;

        const now = Date.now();
        const cooldown = this.cooldown * 1000;

        if (!this.cooldowns.has(user.id)) this.cooldowns?.set(user.id, now + cooldown);

        setTimeout(() => this.cooldowns?.delete(user.id), cooldown);
    }

    getAuthor(interaction: ChatInputCommandInteraction<'cached' | 'raw'> | Message<true>) {
        if (interaction instanceof ChatInputCommandInteraction) {
            return interaction.user;
        } else if (interaction instanceof Message) {
            return interaction.author;
        } else {
            throw new Error('Invalid interaction.');
        }
    }

    getArgs(interaction: ChatInputCommandInteraction<'cached' | 'raw'> | Message<true>) {
        if (interaction instanceof ChatInputCommandInteraction) {
            return interaction.options.data.map((option) => (typeof option.value == 'string' ? option.value.split(/ +/) : option.options)).flat();
        } else if (interaction instanceof Message) {
            return interaction.content.split(/ +/).slice(1);
        } else {
            return [];
        }
    }

    reply(
        interaction: ChatInputCommandInteraction<'cached' | 'raw'> | Message<true>,
        content: string | MessagePayload | MessageCreateOptions | InteractionEditReplyOptions
    ) {
        if (interaction instanceof ChatInputCommandInteraction) {
            return interaction.editReply(content as Exclude<typeof content, MessageCreateOptions>);
        } else if (interaction instanceof Message) {
            return interaction.channel.send(content as Exclude<typeof content, InteractionEditReplyOptions>);
        } else {
            return Promise.reject('Invalid interaction.');
        }
    }

    edit(
        interaction: ChatInputCommandInteraction<'cached' | 'raw'> | Message<true>,
        editable: Message,
        content: string | MessagePayload | MessageEditOptions | InteractionEditReplyOptions
    ) {
        if (interaction instanceof ChatInputCommandInteraction) {
            return interaction.editReply(content as Exclude<typeof content, MessageEditOptions>);
        } else if (interaction instanceof Message) {
            return editable.edit(content as Exclude<typeof content, InteractionEditReplyOptions>);
        } else {
            return Promise.reject('Invalid interaction.');
        }
    }

    get usage() {
        const aliases = this.aliases ? ', ' + this.aliases.map((alias) => this.client.prefix + alias).join(', ') : '';
        return `${this.client.prefix}${this.name}${aliases}${this.description?.format ? ' ' + this.description.format : ''}`;
    }
}