import { Event } from '../../../structures/index.js';
export class NodeReady extends Event {
    constructor(client, commander) {
        super(client, commander, 'nodeReady');
    }
    async execute(name) {
        this.client.logger.info(`Node: ${name}: Has Connected!`, 'Dispatcher');
    }
}
