!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="ff275971-690b-5a05-8e37-b1791a530581")}catch(e){}}();
import { Event } from '../../structures/index.js';
import { EmbedBuilder, Events } from 'discord.js';
export class GuildCreate extends Event {
    constructor(client, commander) {
        super(client, commander, Events.GuildCreate);
    }
    async execute(guild) {
        for (const module of this.commander.modules.filter((m) => m.guilds && m.guilds.includes(guild.id)).values())
            module.emit(this.name, guild);
        const owner = await guild.fetchOwner();
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Joined Guild')
            .addFields({ name: 'Name', value: `\`${guild.name}\``, inline: true }, { name: 'Owner', value: `\`${owner.user.tag}\``, inline: true }, { name: 'Guild ID', value: `\`${guild.id}\``, inline: true }, { name: 'Owner ID', value: `\`${guild.ownerId}\``, inline: true }, { name: 'Members', value: `\`${guild.memberCount}\``, inline: true })
            .setTimestamp();
        this.client.logger.notify(embed);
        this.client.logger.info(`Joined Guild ${guild.name} (${guild.id}) With ${guild.memberCount} Members`, 'DISCORD');
    }
}
//# debugId=ff275971-690b-5a05-8e37-b1791a530581
//# sourceMappingURL=GuildCreate.js.map
