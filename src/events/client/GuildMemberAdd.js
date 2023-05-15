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
