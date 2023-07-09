import { Event, KATClient as Client, Commander } from '@structures/index.js';
import { Events, Invite } from 'discord.js';

export class InviteCreate extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.InviteCreate);
    }

    async execute(invite: Invite) {
        if (invite.guild)
            // @ts-expect-error - Guild is not null.
            for (const module of this.commander.modules.filter((m) => m.guilds && m.guilds.includes(invite.guild.id)).values())
                module.emit(this.name, invite.guild);
    }
}
