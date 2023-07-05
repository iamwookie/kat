!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="215203bd-dbbf-5baf-9cb3-91051847274d")}catch(e){}}();
import { Event, Events } from '../../../structures/index.js';
import { Events as DiscordEvents } from 'discord.js';
export class SubscriptionDestroy extends Event {
    constructor(client, commander) {
        super(client, commander, Events.SubscriptionDestroy);
    }
    async execute(subscription) {
        this.client.logger.warn(`Subscription Destroyed For: ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`, 'Dispatcher');
        if (subscription.message?.deletable)
            subscription.message.delete().catch(() => { });
        await this.client.prisma.queue.upsert({
            where: {
                guildId: subscription.guild.id,
            },
            update: {
                active: false,
            },
            create: {
                guildId: subscription.guild.id,
                voiceId: subscription.voiceChannel.id,
                textId: subscription.textChannel.id,
            },
        });
        this.client.emit(DiscordEvents.Debug, `DATABASE >> Set Queue To Inactive: ${subscription.guild.name} (${subscription.guild.id})`);
    }
}
//# debugId=215203bd-dbbf-5baf-9cb3-91051847274d
//# sourceMappingURL=SubscriptionDestroy.js.map
