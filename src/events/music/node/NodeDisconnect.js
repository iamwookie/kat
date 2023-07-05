!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="e5f7daf6-c6b7-530e-952f-c4df597db4e1")}catch(e){}}();
import { Event } from '../../../structures/index.js';
export class NodeDisconnect extends Event {
    constructor(client, commander) {
        super(client, commander, 'nodeDisconnect');
    }
    async execute(name) {
        this.client.logger.warn(`Node: ${name}: Has Disconnected!`, 'Dispatcher');
    }
}
//# debugId=e5f7daf6-c6b7-530e-952f-c4df597db4e1
//# sourceMappingURL=NodeDisconnect.js.map
