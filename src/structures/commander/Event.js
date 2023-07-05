!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="4b9c577f-149a-5662-b610-8aa6143a5d74")}catch(e){}}();
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
//# debugId=4b9c577f-149a-5662-b610-8aa6143a5d74
//# sourceMappingURL=Event.js.map
