import { Event, KATClient as Client, Commander } from '@structures/index.js';

export class NodeDisconnect extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, 'nodeDisconnect');
    }

    async execute(name: string) {
        this.client.logger.warn(`Node: ${name}: Has Disconnected!`, 'Music');
    }
}
