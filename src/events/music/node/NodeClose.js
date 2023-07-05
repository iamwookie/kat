!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="6a28d280-22c5-5651-a372-2b75a1310185")}catch(e){}}();
import { Event, Events } from '../../../structures/index.js';
export class NodeClose extends Event {
    constructor(client, commander) {
        super(client, commander, Events.NodeClose);
    }
    async execute(name, code) {
        this.client.logger.warn(`Node: ${name}: Has Closed With Code ${code}!`, 'Dispatcher');
    }
}
//# debugId=6a28d280-22c5-5651-a372-2b75a1310185
//# sourceMappingURL=NodeClose.js.map
