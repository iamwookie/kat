!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="05ba694f-40d3-5311-a403-790c46cdedd8")}catch(e){}}();
import { Event } from '../../structures/index.js';
import { Events } from 'discord.js';
export class InviteCreate extends Event {
    constructor(client, commander) {
        super(client, commander, Events.InviteCreate);
    }
    async execute(invite) {
        if (invite.guild)
            // @ts-expect-error - Guild is not null.
            for (const module of this.commander.modules.filter((m) => m.guilds && m.guilds.includes(invite.guild.id)).values())
                module.emit(this.name, invite.guild);
    }
}
//# debugId=05ba694f-40d3-5311-a403-790c46cdedd8
//# sourceMappingURL=InviteCreate.js.map
