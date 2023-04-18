import { Collection, Snowflake } from "discord.js";
import { KATClient as Client } from "./Client";
import { Guild } from "@prisma/client";

// Currently only used for guild configs, in the future will be changed
export class Cache extends Collection<Snowflake, Guild> {
    constructor(private client: Client) {
        super();
    }

    update(guildId: string, res: Guild) {
        this.delete(guildId);
        this.set(guildId, res);
        return res;
    }

    async getConfig(guildId: string): Promise<Guild | undefined> {
        if (this.has(guildId)) return this.get(guildId);

        const res = await this.client.prisma.guild.findUnique({
            where: {
                guildId,
            },
        });
        if (res) this.set(guildId, res);

        return res ?? undefined;
    }
}