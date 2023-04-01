import { Event } from "../../../structures/index.js";
export class NodeReady extends Event {
    constructor(client, commander) {
        super(client, commander, "nodeReady");
    }
    async execute(name) {
        this.client.logger.info(`Music >> Lavalink Node: ${name} has connected!`);
    }
}
