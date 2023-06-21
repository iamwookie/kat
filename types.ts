import { Track } from '@prisma/client';

export type QueueData = Omit<Track, 'id' | 'guildId' | 'createdAt'>;
