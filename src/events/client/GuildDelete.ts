import { Event, KATClient as Client, Commander } from '@structures/index.js';
import { Events, Guild } from 'discord.js';

export class GuildDelete extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.GuildDelete);
    }

    async execute(guild: Guild) {
        this.client.logger.info(`Left Guild ${guild.name} (${guild.id})`, 'DISCORD');

        await this.client.prisma.guild.deleteMany({
            where: {
                guildId: guild.id,
            },
        });

        await this.client.prisma.queue.deleteMany({
            where: {
                guildId: guild.id,
            },
        });
    }
}
