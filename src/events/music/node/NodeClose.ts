import { Event, KATClient as Client, Commander } from "@structures/index.js";

export class NodeClose extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, "nodeClose");
    }

    async execute(name: string, code: number) {
        this.client.logger.warn(`Music >> Lavalink Node: ${name} has closed with code ${code}!`);
    }
}
