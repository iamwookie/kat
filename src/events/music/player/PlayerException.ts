import { Event, KATClient as Client, Commander, Subscription as MusicSubscription } from '@structures/index.js';
import { TrackExceptionEvent } from 'shoukaku';
import { ActionEmbed } from '@utils/embeds/action.js';
import { MusicPrompts } from 'enums.js';

export class PlayerException extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, 'playerException');
    }

    async execute(subscription: MusicSubscription, reason: TrackExceptionEvent) {
        this.client.logger.error(
            reason,
            `Player Exception In: ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`,
            'Music'
        );

        subscription.looped = false;
        subscription.active = null;
        subscription.process();

        subscription.textChannel?.send({ embeds: [new ActionEmbed().setText(MusicPrompts.TrackError)] }).catch(() => {});
    }
}
