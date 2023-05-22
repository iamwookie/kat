import { Collection } from 'discord.js';
export class Cache {
    client;
    guilds;
    music;
    queue;
    constructor(client) {
        this.client = client;
        this.guilds = new GuildCache(client);
        this.music = new MusicCache(client);
        this.queue = new QueueCache(client);
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
    async prefix(guildId) {
        const res = await this.get(guildId);
        return res?.prefix ?? this.client.prefix;
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
class QueueCache extends BaseCache {
    client;
    counts = new Collection();
    constructor(client) {
        super(client);
        this.client = client;
    }
    async count(guildId) {
        if (this.counts.has(guildId))
            return this.counts.get(guildId);
        const res = await this.client.prisma.track.count({
            where: {
                guildId,
            },
        });
        this.counts.set(guildId, res);
        return res;
    }
    increment(guildId) {
        const count = this.counts.get(guildId) ?? 0;
        if (this.counts.has(guildId))
            this.counts.set(guildId, count + 1);
    }
}
