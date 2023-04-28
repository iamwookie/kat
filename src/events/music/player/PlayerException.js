import { Event } from '../../../structures/index.js';
import { ActionEmbed } from '../../../utils/embeds/action.js';
import { ErrorPrompts } from '../../../../enums.js';
export class PlayerException extends Event {
    constructor(client, commander) {
        super(client, commander, 'playerException');
    }
    async execute(subscription, reason) {
        this.client.logger.error(reason, `Player Exception In: ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`, 'Music');
        subscription.looped = false;
        subscription.active = null;
        subscription.process();
        subscription.textChannel?.send({ embeds: [new ActionEmbed().setText(ErrorPrompts.TrackError)] }).catch(() => { });
    }
}
