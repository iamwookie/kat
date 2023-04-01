import { Event } from "../../../structures/index.js";
export class NodeReconnecting extends Event {
    constructor(client, commander) {
        super(client, commander, "nodeReconnecting");
    }
    async execute(name) {
        this.client.shoukaku.retries.set(name, (this.client.shoukaku.retries.get(name) ?? 0) + 1);
    }
}
