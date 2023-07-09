!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="9e20b986-becb-567d-843f-fdb113be6b19")}catch(e){}}();
import { Event } from '../../structures/index.js';
import { Events } from 'discord.js';
export class GuildMemberAdd extends Event {
    constructor(client, commander) {
        super(client, commander, Events.GuildMemberAdd);
    }
    async execute(member) {
        if (member.user.bot)
            return;
        for (const module of this.commander.modules.filter((m) => m.guilds && m.guilds.includes(member.guild.id)).values())
            module.emit(this.name, member);
    }
}
//# debugId=9e20b986-becb-567d-843f-fdb113be6b19
//# sourceMappingURL=GuildMemberAdd.js.map
