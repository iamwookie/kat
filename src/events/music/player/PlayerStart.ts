import { Event, KATClient as Client, Commander, Subscription as MusicSubscription } from '@structures/index.js';

export class PlayerStart extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, 'playerStart');
    }

    async execute(subscription: MusicSubscription) {
        this.client.logger.info(
            `Started Playing In: ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`,
            'Music'
        );
    }
}
