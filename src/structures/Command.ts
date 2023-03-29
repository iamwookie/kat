import { KATClient } from "./Client.js";
import { Commander } from "./Commander.js";
import { SlashCommandBuilder, ChatInputCommandInteraction, User, Message, Collection, Snowflake, InteractionEditReplyOptions, MessagePayload, MessageReplyOptions } from "discord.js";

export abstract class Command {
    public name: string;
    public group: string;
    public aliases?: string[];
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
    abstract execute(client: KATClient, interaction: ChatInputCommandInteraction | Message): Promise<any>;

    constructor(
        private commander: Commander
    ) {
        this.commander = commander;
    }

    initialize() {
        if (this.aliases) {
            for (const alias of this.aliases) {
                this.commander.aliases.set(alias, this.name);
            }
        }

        if (this.legacyAliases) {
            for (const alias of this.legacyAliases) {
                this.commander.aliases.set(alias, this.name);
            }
        }

        if (this.users) this.users.push(this.commander.client.devId);

        if (this.guilds) {
            for (const guildId of this.guilds) {
                const guild = this.commander.guilds.get(guildId) || {};
                guild.commands = guild.commands || new Collection();

                guild.commands.set(this.name, this);
                this.commander.guilds.set(guildId, guild);
            }
        } else {
            this.commander.global.set(this.name, this);
        }

        if (!this.commander.groups.has(this.group)) this.commander.groups.set(this.group, new Collection());
        this.commander.groups.get(this.group)?.set(this.name, this);
    }

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
            return interaction.options.data.map((option) => typeof option.value == "string" ? option.value.split(/ +/) : option.value).flat();;
        } else if (interaction instanceof Message) {
            return interaction.content.split(/ +/).slice(1);
        }

        return [];
    }

    reply(interaction: ChatInputCommandInteraction | Message, content: string | MessagePayload | MessageReplyOptions | InteractionEditReplyOptions) {
        if (interaction instanceof ChatInputCommandInteraction) {
            return interaction.editReply(content as string | MessagePayload | InteractionEditReplyOptions);
        } else if (interaction instanceof Message) {
            return interaction.reply(content as string | MessagePayload | MessageReplyOptions);
        }
    }
}
