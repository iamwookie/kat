import { Event } from '../../../structures/index.js';
export class PlayerException extends Event {
    constructor(client, commander) {
        super(client, commander, 'playerException');
    }
    async execute(subscription, reason) {
        this.client.logger.error(reason, `Player Exception In: ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`, 'Music');
        subscription.active?.onError(reason);
        subscription.looped = false;
        subscription.active = null;
        subscription.process();
    }
}
