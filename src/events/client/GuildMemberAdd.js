import { Event } from '../../structures/index.js';
import { Events } from 'discord.js';
export class GuildMemberAdd extends Event {
    constructor(client, commander) {
        super(client, commander, Events.GuildMemberAdd);
    }
    async execute(member) {
        if (member.user.bot)
            return; // Ignore bots (for now)
        for (const module of this.commander.modules.values()) {
            if (module.guilds?.includes(member.guild.id))
                module.onGuildMemberAdd(member);
        }
    }
}
