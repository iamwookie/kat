import { KATClient as Client } from "./Client.js";
import { Commander } from "./Commander.js";

export abstract class Event {
    abstract execute(...args: any[]): Promise<any>;

    constructor(
        public client: Client,
        public commander: Commander,
        public name: string
    ) {
        this.client = client;
        this.commander = commander;
        this.name = name;
    }
}