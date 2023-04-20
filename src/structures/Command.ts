import { KATClient as Client } from "./Client.js";
import { Commander } from "./Commander.js";
import { Module } from "./Module.js";
import { SlashCommandBuilder, ChatInputCommandInteraction, User, Message, Collection, Snowflake, InteractionEditReplyOptions, MessagePayload, MessageReplyOptions } from "discord.js";

export abstract class Command {
    public name: string;
    public group: string;
    public module?: string | Module;
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

    public guilds?: Snowflake[];
    public users?: Snowflake[];

    public cooldowns: Collection<Snowflake, number> = new Collection();

    abstract data(): SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    abstract execute(interaction: ChatInputCommandInteraction | Message): Promise<any>;

    constructor(public client: Client, public commander: Commander) {}

    applyCooldown(user: User): void {
        if (!this.cooldown) return;

        const now = Date.now();
        const cooldown = this.cooldown * 1000;

        if (!this.cooldowns.has(user.id)) this.cooldowns?.set(user.id, now + cooldown);

        setTimeout(() => this.cooldowns?.delete(user.id), cooldown);
    }

    getAuthor(interaction: ChatInputCommandInteraction | Message) {
        if (interaction instanceof ChatInputCommandInteraction) {
            return interaction.user;
        } else if (interaction instanceof Message) {
            return interaction.author;
        }
    }

    getArgs(interaction: ChatInputCommandInteraction | Message) {
        if (interaction instanceof ChatInputCommandInteraction) {
            return interaction.options.data.map((option) => (typeof option.value == "string" ? option.value.split(/ +/) : option.options)).flat();
        } else if (interaction instanceof Message) {
            return interaction.content.split(/ +/).slice(1);
        }

        return [];
    }

    reply(interaction: ChatInputCommandInteraction | Message, content: string | MessagePayload | MessageReplyOptions | InteractionEditReplyOptions) {
        if (interaction instanceof ChatInputCommandInteraction) {
            return interaction.editReply(content as string | MessagePayload | InteractionEditReplyOptions);
        } else if (interaction instanceof Message) {
            return interaction.channel.send(content as string | MessagePayload | MessageReplyOptions);
        }
    }

    get usage() {
        const aliases = this.aliases ? ", " + this.aliases.map((alias) => this.client.prefix + alias).join(", ") : "";
        return `${this.client.prefix}${this.name}${aliases}${this.description?.format ? " " + this.description.format : ""}`;
    }
}
