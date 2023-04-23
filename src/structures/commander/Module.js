import { Collection } from "discord.js";
export class Module {
    client;
    commander;
    name;
    guilds;
    commands = new Collection();
    constructor(client, commander, options) {
        this.client = client;
        this.commander = commander;
        this.name = options.name;
        this.guilds = options.guilds;
    }
    onReady(client) { }
    onInviteCreate(invite) { }
    onGuildCreate(guild) { }
    onGuildMemberAdd(member) { }
}
