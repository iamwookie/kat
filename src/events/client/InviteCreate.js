import { Event } from '../../structures/index.js';
import { Events } from 'discord.js';
export class InviteCreate extends Event {
    constructor(client, commander) {
        super(client, commander, Events.InviteCreate);
    }
    async execute(invite) {
        for (const module of this.commander.modules.values())
            module.emit(this.name, invite);
    }
}
