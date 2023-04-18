import { Collection } from "discord.js";
// Currently only used for guild configs, in the future will be changed
export class Cache extends Collection {
    client;
    constructor(client) {
        super();
        this.client = client;
    }
    update(guildId, res) {
        this.delete(guildId);
        this.set(guildId, res);
        return res;
    }
    async getConfig(guildId) {
        if (this.has(guildId))
            return this.get(guildId);
        const res = await this.client.prisma.guild.findUnique({
            where: {
                guildId,
            },
        });
        if (res)
            this.set(guildId, res);
        return res ?? undefined;
    }
}
