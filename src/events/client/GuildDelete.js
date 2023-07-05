!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="2426ce2a-4eb8-5fa4-b96f-5e14c1cfcfd7")}catch(e){}}();
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
//# debugId=2426ce2a-4eb8-5fa4-b96f-5e14c1cfcfd7
//# sourceMappingURL=GuildDelete.js.map
