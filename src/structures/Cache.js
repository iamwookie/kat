import { Collection } from "discord.js";
// Currently only used for guild configs, in the future will be changed
export class Cache {
    client;
    guilds;
    music;
    constructor(client) {
        this.client = client;
        this.guilds = new GuildCache(client);
        this.music = new MusicCache(client);
    }
}
class BaseCache {
    client;
    cache = new Collection();
    constructor(client) {
        this.client = client;
    }
    update(key, data) {
        this.cache.set(key, data);
        return data;
    }
}
class GuildCache extends BaseCache {
    client;
    constructor(client) {
        super(client);
        this.client = client;
    }
    async get(guildId) {
        if (this.cache.has(guildId))
            return this.cache.get(guildId);
        const res = await this.client.prisma.guild.findUnique({
            where: {
                guildId,
            },
        });
        if (res)
            this.cache.set(guildId, res);
        return res ?? undefined;
    }
}
class MusicCache extends BaseCache {
    client;
    constructor(client) {
        super(client);
        this.client = client;
    }
    async get(guildId) {
        if (this.cache.has(guildId))
            return this.cache.get(guildId);
        const res = await this.client.prisma.music.findUnique({
            where: {
                guildId,
            },
        });
        if (res)
            this.cache.set(guildId, res);
        return res ?? undefined;
    }
}
