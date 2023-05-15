import { Event } from '../../structures/index.js';
import { Events } from 'discord.js';
export class InviteCreate extends Event {
    constructor(client, commander) {
        super(client, commander, Events.InviteCreate);
    }
    async execute(invite) {
        if (!invite.guild)
            return;
        for (const module of this.commander.modules.values()) {
            if (module.guilds && !module.guilds.includes(invite.guild.id))
                continue;
            module.emit(this.name, invite);
        }
    }
}
