import { Event } from '../../structures/index.js';
import { Events } from 'discord.js';
import { ErrorEmbed } from '../../utils/embeds/index.js';
export class MessageCreate extends Event {
    constructor(client, commander) {
        super(client, commander, Events.MessageCreate);
    }
    async execute(message) {
        if (message.author.bot)
            return;
        let prefix = this.client.isDev(message.author) ? this.client.devPrefix : this.client.legacyPrefix;
        if (!this.client.isDev(message.author) && message.inGuild()) {
            const config = await this.client.cache.guilds.get(message.guild.id);
            prefix = config?.prefix || prefix;
        }
        if (!message.content.startsWith(prefix))
            return;
        const commandName = message.content.slice(prefix.length).split(/ +/).shift()?.toLowerCase();
        const command = commandName ? this.commander.commands.get(commandName) || this.commander.commands.get(this.commander.aliases.get(commandName)) : undefined;
        if (!command || !command.legacy || command.disabled)
            return;
        if (!this.commander.authorize(message, command))
            return;
        try {
            await command.execute(message);
        }
        catch (err) {
            const eventId = this.client.logger.error(err, 'Error Running Chat Command', 'Commander');
            message.channel.send({ embeds: [new ErrorEmbed(eventId)] }).catch(() => { });
        }
    }
}
