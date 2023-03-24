import { KATClient } from "./Client.js";
import { Commander } from "./Commander.js";
import { User, Guild, ChatInputCommandInteraction, SlashCommandBuilder, Collection, Snowflake } from "discord.js";

export class Command {
    public name: string;
    public group: string;
    public aliases?: string[];

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
    
    public cooldowns: Collection<Snowflake, Collection<Snowflake, number>> = new Collection();

    constructor(
        private commander: Commander
    ) {
        this.commander = commander;
    }

    data(): SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> {
        return new SlashCommandBuilder()
    }

    async execute(client: KATClient, interaction: ChatInputCommandInteraction): Promise<any> {
        return Promise.resolve();
    }

    async initialize() {
        if (this.aliases) {
            for (const alias of this.aliases) {
                this.commander.aliases.set(alias, this.name);
            }
        }

        // ------- REVAMP COMMAND ACCESS MANAGER ------- //
        // if (this.guilds || this.users) {
        //     if (this.commander.client.database) {
        //         const data = await this.commander.client.database.getAccess(this.name);
        //         if (data.guilds && this.guilds) this.guilds.push(...data.guilds);
        //         if (data.users && this.users) this.users.push(...data.users);
        //     }

        //     if (this.users) this.users.push(this.commander.client.devId);
        // }

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

    applyCooldown(guild: Guild, user: User): void {
        if (!this.cooldown) return;

        const now = Date.now();

        const cooldown = this.cooldown * 1000;
        if (!this.cooldowns.has(guild?.id || "dm")) this.cooldowns.set(guild?.id || "dm", new Collection());

        const cooldowns = this.cooldowns.get(guild?.id || "dm");
        if (!cooldowns?.has(user.id)) cooldowns?.set(user.id, now + cooldown);

        setTimeout(() => cooldowns?.delete(user.id), cooldown);
    }
}
