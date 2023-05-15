import { Event } from '../../structures/index.js';
import { Events } from 'discord.js';
export class GuildDelete extends Event {
    constructor(client, commander) {
        super(client, commander, Events.GuildDelete);
    }
    async execute(guild) {
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
