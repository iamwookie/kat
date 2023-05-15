import { Collection, Snowflake } from 'discord.js';
import { KATClient as Client } from './Client';
import { Guild, Music, Queue } from '@prisma/client';

export class Cache {
    public guilds: GuildCache;
    public music: MusicCache;
    public queue: QueueCache;

    constructor(public client: Client) {
        this.guilds = new GuildCache(client);
        this.music = new MusicCache(client);
        this.queue = new QueueCache(client);
    }
}

class BaseCache<T> {
    public cache = new Collection<Snowflake, T>();

    constructor(public client: Client) {}

    update(key: string, data: T) {
        this.cache.set(key, data);
        return data;
    }
}

class GuildCache extends BaseCache<Guild> {
    constructor(public client: Client) {
        super(client);
    }

    async get(guildId: Snowflake) {
        if (this.cache.has(guildId)) return this.cache.get(guildId)!;

        const res = await this.client.prisma.guild.findUnique({
            where: {
                guildId,
            },
        });
        if (res) this.cache.set(guildId, res);

        return res ?? undefined;
    }
}

class MusicCache extends BaseCache<Music> {
    constructor(public client: Client) {
        super(client);
    }

    async get(guildId: Snowflake) {
        if (this.cache.has(guildId)) return this.cache.get(guildId)!;

        const res = await this.client.prisma.music.findUnique({
            where: {
                guildId,
            },
        });
        if (res) this.cache.set(guildId, res);

        return res ?? undefined;
    }
}

class QueueCache extends BaseCache<Queue> {
    public counts = new Collection<Snowflake, number>();

    constructor(public client: Client) {
        super(client);
    }

    async count(guildId: Snowflake) {
        if (this.counts.has(guildId)) return this.counts.get(guildId)!;

        const res = await this.client.prisma.track.count({
            where: {
                guildId,
            },
        });
        this.counts.set(guildId, res);

        return res;
    }

    increment(guildId: Snowflake) {
        const count = this.counts.get(guildId) ?? 0;
        if(this.counts.has(guildId)) this.counts.set(guildId, count + 1);
    }
}
