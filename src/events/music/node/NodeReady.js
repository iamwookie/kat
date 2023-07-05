!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="7577b55c-d9e8-5a04-93d7-96dd5993c1d6")}catch(e){}}();
import { Event } from '../../../structures/index.js';
export class NodeReady extends Event {
    constructor(client, commander) {
        super(client, commander, 'nodeReady');
    }
    async execute(name) {
        this.client.logger.info(`Node: ${name}: Has Connected!`, 'Dispatcher');
    }
}
//# debugId=7577b55c-d9e8-5a04-93d7-96dd5993c1d6
//# sourceMappingURL=NodeReady.js.map
