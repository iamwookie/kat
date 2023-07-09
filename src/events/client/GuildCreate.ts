import { Event, KATClient as Client, Commander } from '@structures/index.js';
import { EmbedBuilder, Events, Guild } from 'discord.js';

export class GuildCreate extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.GuildCreate);
    }

    async execute(guild: Guild) {
        for (const module of this.commander.modules.filter((m) => m.guilds && m.guilds.includes(guild.id)).values()) module.emit(this.name, guild);

        const owner = await guild.fetchOwner();
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Joined Guild')
            .addFields(
                { name: 'Name', value: `\`${guild.name}\``, inline: true },
                { name: 'Owner', value: `\`${owner.user.tag}\``, inline: true },
                { name: 'Guild ID', value: `\`${guild.id}\``, inline: true },
                { name: 'Owner ID', value: `\`${guild.ownerId}\``, inline: true },
                { name: 'Members', value: `\`${guild.memberCount}\``, inline: true }
            )
            .setTimestamp();
        this.client.logger.notify(embed);

        this.client.logger.info(`Joined Guild ${guild.name} (${guild.id}) With ${guild.memberCount} Members`, 'DISCORD');
    }
}
