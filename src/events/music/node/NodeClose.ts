import { Event, KATClient as Client, Commander, Events } from '@structures/index.js';

export class NodeClose extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.NodeClose);
    }

    async execute(name: string, code: number) {
        this.client.logger.warn(`Node: ${name}: Has Closed With Code ${code}!`, 'Dispatcher');
    }
}
