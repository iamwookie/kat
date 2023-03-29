import { Event, KATClient as Client, Commander } from "@structures/index.js";

export class NodeReconnecting extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, "nodeReconnecting");
    }

    async execute(name: string) {
        this.client.shoukaku.retries.set(name, (this.client.shoukaku.retries.get(name) ?? 0) + 1);
    }
}
