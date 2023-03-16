import { Commander } from "@src/commander/index.js";
import {
    Client,
    User,
    Guild,
    Message,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    Collection,
    Snowflake,
} from "discord.js";

export class CommanderCommand {
    public name: string;
    public group: string;
    public aliases?: string[];
    public description?: string;
    public format?: string;
    public disabled?: boolean;
    public cooldown?: number;
    public ephemeral?: boolean;

    public guilds?: Snowflake[];
    public users?: Snowflake[];

    public data: () => Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

    public execute: (
        client: Client,
        interaction: ChatInputCommandInteraction
    ) => Promise<void | Message>;

    public cooldowns: Collection<Snowflake, Collection<Snowflake, number>> = new Collection();

    constructor(
        private commander: Commander,
    ) {
        this.commander = commander;
    }

    async initialize() {
        if (this.aliases) {
            for (const alias of this.aliases) {
                this.commander.aliases.set(alias, this.name);
            }
        }

        if (this.guilds || this.users) {
            if (this.commander.client.database) {
                const data = await this.commander.client.database.getAccess(this.name);
                if (data.guilds && this.guilds) this.guilds.push(...data.guilds);
                if (data.users && this.users) this.users.push(...data.users);
            }

            if (this.users) this.users.push(this.commander.client.devId);
        }

        if (this.guilds) {
            for (const guildId of this.guilds) {
                if (!this.commander.client.guilds.cache.has(guildId)) this.commander.client.logger?.warn(`Commander >> Guild (${guildId}) Not Found For Command: ${this.name}`);

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

    applyCooldown(guild: Guild, user: User): void {
        if (!this.cooldown) return;

        const now = Date.now();

        const cooldown = this.cooldown * 1000;
        if (!this.cooldowns.has(guild?.id || "dm"))
            this.cooldowns.set(guild?.id || "dm", new Collection());

        const cooldowns = this.cooldowns.get(guild?.id || "dm");
        if (!cooldowns?.has(user.id)) cooldowns?.set(user.id, now + cooldown);

        setTimeout(() => cooldowns?.delete(user.id), cooldown);
    }
}
