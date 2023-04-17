import { KATClient as Client } from "./Client.js";
import { Commander } from "./Commander.js";

export abstract class Event {
    abstract execute(...args: any[]): Promise<any>;

    constructor(
        public client: Client,
        public commander: Commander,
        public name: string
    ) {}
}

export abstract class ProcessEvent {
    abstract execute(...args: any[]): Promise<any>;

    constructor(
        public commander: Commander,
        public name: string
    ) {}
}
