import { Event, KATClient as Client, Commander } from '@structures/index.js';
import { Events, GuildMember } from 'discord.js';

export class GuildMemberAdd extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.GuildMemberAdd);
    }

    async execute(member: GuildMember) {
        if (member.user.bot) return;

        for (const module of this.commander.modules.values()) {
            if (module.guilds && !module.guilds.includes(member.guild.id)) continue;
            module.emit(this.name, member);
        }
    }
}
