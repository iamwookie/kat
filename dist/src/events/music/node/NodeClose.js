import { Event } from "../../../structures/index.js";
export class NodeClose extends Event {
    constructor(client, commander) {
        super(client, commander, "nodeClose");
    }
    async execute(name, code) {
        this.client.logger.warn(`Music >> Node: ${name} has closed with code ${code}!`);
    }
}
