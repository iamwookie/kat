!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="8f72bad9-45f9-57d0-8095-4216c2b76b23")}catch(e){}}();
import { Event } from '../../../structures/index.js';
import { MusicEmbed } from '../../../utils/embeds/index.js';
export class PlayerStart extends Event {
    constructor(client, commander) {
        super(client, commander, 'playerStart');
    }
    async execute(subscription) {
        this.client.logger.info(`Started Playing In: ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`, 'Dispatcher');
        if (subscription.message?.deletable)
            subscription.message.delete().catch(() => { });
        if (subscription.active)
            subscription.message = await subscription.textChannel
                .send({ embeds: [new MusicEmbed(subscription).setUser(subscription.active.requester).setPlaying(subscription.active)] })
                .catch(() => undefined);
    }
}
//# debugId=8f72bad9-45f9-57d0-8095-4216c2b76b23
//# sourceMappingURL=PlayerStart.js.map
