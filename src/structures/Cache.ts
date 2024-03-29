import { KATClient as Client } from './Client';
import { Snowflake } from 'discord.js';
import { Music } from '@prisma/client';

export class Cache {
    public music: MusicCache;
    public queue: QueueCache;

    constructor(public client: Client) {
        this.music = new MusicCache(client);
        this.queue = new QueueCache(client);

        this.client.logger.status('>>>> Cache Initialized!');
    }
}
class MusicCache {
    private key: string;

    constructor(private client: Client) {
        this.key = 'kat:music';
    }

    async get(guildId: Snowflake): Promise<Music | null> {
        try {
            const res = await this.client.redis.hget<Music>(this.key, guildId);
            if (res) return res;

            const data = await this.client.prisma.music.findUnique({ where: { guildId } });
            if (data) {
                await this.client.redis.hset(this.key, { [guildId]: data });
                await this.client.redis.expire(this.key, this.client.config.cache.musicTimeout);
            }

            return data;
        } catch (err) {
            this.client.logger.error(err, 'Error Getting Music Data', 'MusicCache');
            return null;
        }
    }

    async set(guildId: Snowflake, data: Music): Promise<void> {
        try {
            await this.client.redis.hset(this.key, { [guildId]: data });
            await this.client.redis.expire(this.key, this.client.config.cache.musicTimeout);
        } catch (err) {
            this.client.logger.error(err, 'Error Setting Music Data', 'MusicCache');
        }
    }
}

class QueueCache {
    private key;

    constructor(private client: Client) {
        this.key = 'kat:queue';
    }

    async count(guildId: Snowflake): Promise<number> {
        try {
            const res = await this.client.redis.hget<number>(this.key + ':counts', guildId);
            if (res) return res;

            const data = await this.client.prisma.track.count({ where: { guildId } });
            if (data) {
                await this.client.redis.hset(this.key + ':counts', { [guildId]: data });
                await this.client.redis.expire(this.key + ':counts', this.client.config.cache.queueTimeout);
            }

            return data;
        } catch (err) {
            this.client.logger.error(err, 'Error Getting Queue Count', 'QueueCache');
            return 0;
        }
    }

    async increment(guildId: Snowflake): Promise<void> {
        try {
            await this.client.redis.hincrby(this.key + ':counts', guildId, 1);
            await this.client.redis.expire(this.key + ':counts', this.client.config.cache.queueTimeout);
        } catch (err) {
            this.client.logger.error(err, 'Error Incrementing Queue Count', 'QueueCache');
        }
    }
}
