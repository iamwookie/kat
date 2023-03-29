import { Event, KATClient as Client, Commander } from "@structures/index.js";

export class NodeReady extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, "nodeReady");
    }

    async execute(name: string) {
        this.client.logger.info(`Music >> Lavalink Node: ${name} has connected!`);
    }
}