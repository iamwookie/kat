import { Event } from '../../../structures/index.js';
export class NodeDisconnect extends Event {
    constructor(client, commander) {
        super(client, commander, 'nodeDisconnect');
    }
    async execute(name) {
        this.client.logger.warn(`Node: ${name}: Has Disconnected!`, 'Dispatcher');
    }
}
