!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="d15e89a2-fe72-536d-8022-c443eb819a3c")}catch(e){}}();
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
//# debugId=d15e89a2-fe72-536d-8022-c443eb819a3c
//# sourceMappingURL=InviteCreate.js.map
