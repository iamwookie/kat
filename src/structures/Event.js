export class Event {
    client;
    commander;
    name;
    constructor(client, commander, name) {
        this.client = client;
        this.commander = commander;
        this.name = name;
    }
}
export class ProcessEvent {
    commander;
    name;
    constructor(commander, name) {
        this.commander = commander;
        this.name = name;
    }
}
