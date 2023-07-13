!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="99e41555-a513-508c-a4c3-2fb5da33722e")}catch(e){}}();
export class Cache {
    client;
    music;
    queue;
    constructor(client) {
        this.client = client;
        this.music = new MusicCache(client);
        this.queue = new QueueCache(client);
        this.client.logger.status('>>>> Cache Initialized!');
    }
}
class MusicCache {
    client;
    key;
    constructor(client) {
        this.client = client;
        this.key = 'kat:music';
    }
    async get(guildId) {
        try {
            const res = await this.client.redis.hget(this.key, guildId);
            if (res)
                return res;
            const data = await this.client.prisma.music.findUnique({ where: { guildId } });
            if (data) {
                await this.client.redis.hset(this.key, { [guildId]: data });
                await this.client.redis.expire(this.key, this.client.config.cache.musicTimeout);
            }
            return data;
        }
        catch (err) {
            this.client.logger.error(err, 'Error Getting Music Data', 'MusicCache');
            return null;
        }
    }
    async set(guildId, data) {
        try {
            await this.client.redis.hset(this.key, { [guildId]: data });
            await this.client.redis.expire(this.key, this.client.config.cache.musicTimeout);
        }
        catch (err) {
            this.client.logger.error(err, 'Error Setting Music Data', 'MusicCache');
        }
    }
}
class QueueCache {
    client;
    key;
    constructor(client) {
        this.client = client;
        this.key = 'kat:queue';
    }
    async count(guildId) {
        try {
            const res = await this.client.redis.hget(this.key + ':counts', guildId);
            if (res)
                return res;
            const data = await this.client.prisma.track.count({ where: { guildId } });
            if (data) {
                await this.client.redis.hset(this.key + ':counts', { [guildId]: data });
                await this.client.redis.expire(this.key + ':counts', this.client.config.cache.queueTimeout);
            }
            return data;
        }
        catch (err) {
            this.client.logger.error(err, 'Error Getting Queue Count', 'QueueCache');
            return 0;
        }
    }
    async increment(guildId) {
        try {
            await this.client.redis.hincrby(this.key + ':counts', guildId, 1);
            await this.client.redis.expire(this.key + ':counts', this.client.config.cache.queueTimeout);
        }
        catch (err) {
            this.client.logger.error(err, 'Error Incrementing Queue Count', 'QueueCache');
        }
    }
}
//# debugId=99e41555-a513-508c-a4c3-2fb5da33722e
//# sourceMappingURL=Cache.js.map
