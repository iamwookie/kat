import { Event } from '../../../structures/index.js';
export class NodeClose extends Event {
    constructor(client, commander) {
        super(client, commander, 'nodeClose');
    }
    async execute(name, code) {
        this.client.logger.warn(`Node: ${name}: Has Closed With Code ${code}!`, 'Music');
    }
}
