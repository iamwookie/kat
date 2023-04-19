import { Collection, Snowflake } from "discord.js";
import { KATClient as Client } from "./Client";
import { Guild, Music } from "@prisma/client";

// Currently only used for guild configs, in the future will be changed

export class Cache {
    public guilds: GuildCache;
    public music: MusicCache;

    constructor(public client: Client) {
        this.guilds = new GuildCache(client);
        this.music = new MusicCache(client);
    }
}

class BaseCache<T> {
    public cache: Collection<Snowflake, T> = new Collection();

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

    async get(guildId: Snowflake): Promise<Guild | undefined> {
        if (this.cache.has(guildId)) return this.cache.get(guildId);

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

    async get(guildId: Snowflake): Promise<Music | undefined> {
        if (this.cache.has(guildId)) return this.cache.get(guildId);

        const res = await this.client.prisma.music.findUnique({
            where: {
                guildId,
            },
        });
        if (res) this.cache.set(guildId, res);

        return res ?? undefined;
    }
}
