import { Event } from '../../structures/index.js';
import { Events } from 'discord.js';
export class InviteCreate extends Event {
    constructor(client, commander) {
        super(client, commander, Events.InviteCreate);
    }
    async execute(invite) {
        this.commander.modules.forEach((module) => {
            if (module.guilds?.includes(invite.guild?.id))
                module.onInviteCreate(invite);
        });
    }
}
