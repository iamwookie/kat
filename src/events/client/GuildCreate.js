!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="7013e79b-27f4-5e71-9641-bb8e5a99e2d5")}catch(e){}}();
import { Event } from '../../structures/index.js';
import { EmbedBuilder, Events } from 'discord.js';
export class GuildCreate extends Event {
    constructor(client, commander) {
        super(client, commander, Events.GuildCreate);
    }
    async execute(guild) {
        this.client.logger.info(`Joined Guild ${guild.name} (${guild.id}) With ${guild.memberCount} Members`, 'DISCORD');
        for (const module of this.commander.modules.values()) {
            if (module.guilds && !module.guilds.includes(guild.id))
                continue;
            module.emit(this.name, guild);
        }
        const owner = await guild.fetchOwner();
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Joined Guild')
            .addFields({ name: 'Name', value: `\`${guild.name}\``, inline: true }, { name: 'Owner', value: `\`${owner.user.tag}\``, inline: true }, { name: 'Guild ID', value: `\`${guild.id}\``, inline: true }, { name: 'Owner ID', value: `\`${guild.ownerId}\``, inline: true }, { name: 'Members', value: `\`${guild.memberCount}\``, inline: true })
            .setTimestamp();
        this.client.logger.notify(embed);
    }
}
//# debugId=7013e79b-27f4-5e71-9641-bb8e5a99e2d5
//# sourceMappingURL=GuildCreate.js.map
