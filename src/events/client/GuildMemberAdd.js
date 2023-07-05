!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="85df0066-7ec6-5042-8cc8-be0d3d570d7c")}catch(e){}}();
import { Event } from '../../structures/index.js';
import { Events } from 'discord.js';
export class GuildMemberAdd extends Event {
    constructor(client, commander) {
        super(client, commander, Events.GuildMemberAdd);
    }
    async execute(member) {
        if (member.user.bot)
            return;
        for (const module of this.commander.modules.values()) {
            if (module.guilds && !module.guilds.includes(member.guild.id))
                continue;
            module.emit(this.name, member);
        }
    }
}
//# debugId=85df0066-7ec6-5042-8cc8-be0d3d570d7c
//# sourceMappingURL=GuildMemberAdd.js.map
