export class Module {
    client;
    commander;
    name;
    guilds;
    constructor(client, commander) {
        this.client = client;
        this.commander = commander;
    }
    onReady(client) { }
    onInviteCreate(invite) { }
    onGuildCreate(guild) { }
    onGuildMemberAdd(member) { }
}
