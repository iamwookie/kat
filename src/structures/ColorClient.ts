import { KATClient as Client } from "./Client.js";
import { Collection, GuildMember, Snowflake } from "discord.js";

export class ColorClient {
    private guilds: Collection<Snowflake, Snowflake[]> = new Collection();

    constructor(
        public client: Client,
    ) {
        this.client = client;
    }

    async initialize() {
        const guilds = await this.client.guilds.fetch();

        for (const [_, guild] of guilds) {
            const data = await this.client.database?.get(guild.id, "colors");
            if (!data) continue;

            this.guilds.set(guild.id, data);
        }
    }

    get(guild: Snowflake | null) {
        return this.guilds.get(guild ?? "");
    }

    async create(guild: Snowflake, id: Snowflake) {
        if (this.guilds.get(guild)?.includes(id)) return;

        const data = this.guilds.get(guild) || [];
        data.push(id)

        this.guilds.set(guild, data);

        return await this.client.database?.set(guild, "colors", data);
    }

    async delete(guild: Snowflake, id: Snowflake) {
        if (!this.guilds.get(guild)?.includes(id)) return;

        const data = this.guilds.get(guild) || [];
        data.splice(data.indexOf(id), 1);

        this.guilds.set(guild, data);

        if (!data.length) {
            return await this.client.database?.delete(guild, "colors");
        } else {
            return await this.client.database?.set(guild, "colors", data);
        }
    }

    async clear(guild: Snowflake, member: GuildMember) {
        const data = this.guilds.get(guild) || [];

        for (const id of data) {
            if (member.roles.cache.has(id)) await member.roles.remove(id);
        }
    }
}