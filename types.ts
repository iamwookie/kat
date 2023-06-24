import { Track } from '@prisma/client';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DISCORD_TOKEN: string;
            DISCORD_APP_ID: string;
            SENTRY_DSN: string;
            DATABASE_URL: string;
            UPSTASH_REDIS_REST_URL: string;
            UPSTASH_REDIS_REST_TOKEN: string;
            LAVALINK_HOST: string;
            LAVALINK_AUTH: string;
        }
    }
}

export type QueueData = Omit<Track, 'id' | 'guildId' | 'createdAt'>;
