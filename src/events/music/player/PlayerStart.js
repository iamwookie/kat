import { Event } from '../../../structures/index.js';
import { MusicEmbed } from '../../../utils/embeds/index.js';
export class PlayerStart extends Event {
    constructor(client, commander) {
        super(client, commander, 'playerStart');
    }
    async execute(subscription) {
        this.client.logger.info(`Started Playing In: ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`, 'Music');
        if (!subscription.active)
            return;
        if (subscription.message?.deletable)
            await subscription.message.delete().catch(() => undefined);
        subscription.message = await subscription.textChannel
            .send({ embeds: [new MusicEmbed(subscription).setColor('White').setUser(subscription.active.requester).setPlaying(subscription.active)] })
            .catch(() => undefined);
    }
}
