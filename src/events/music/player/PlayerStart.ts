import { Event, KATClient as Client, Commander, Subscription as MusicSubscription } from '@structures/index.js';
import { MusicEmbed } from '@utils/embeds/index.js';

export class PlayerStart extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, 'playerStart');
    }

    async execute(subscription: MusicSubscription) {
        this.client.logger.info(`Started Playing In: ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`, 'Dispatcher');

        if (subscription.message?.deletable) subscription.message.delete().catch(() => {});
        if (subscription.active)
            subscription.message = await subscription.textChannel
                .send({ embeds: [new MusicEmbed(subscription).setUser(subscription.active.requester).setPlaying(subscription.active)] })
                .catch(() => undefined);
    }
}
