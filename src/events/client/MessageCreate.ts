import { Event, KATClient as Client, Commander } from '@structures/index.js';
import { Events, Message } from 'discord.js';
import { ErrorEmbed } from '@utils/embeds/index.js';

export class MessageCreate extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.MessageCreate);
    }

    async execute(message: Message) {
        if (message.author.bot) return;

        const config = await this.client.cache.guilds.get(message.guild?.id!);
        const prefix = config?.prefix || this.client.legacyPrefix;
        if (!message.content.startsWith(prefix)) return;

        const commandName = message.content.slice(prefix.length).trim().split(/ +/).shift()?.toLowerCase()!;
        const command =
            this.commander.commands.get(commandName) ||
            this.commander.commands.get(this.commander.aliases.get(commandName)!);
        if (!command || !command.legacy || command.disabled) return;

        if (command.module.guilds && !command.module.guilds.includes(message.guild?.id!)) return;

        if (!this.commander.validate(message, command)) return;

        try {
            await command.execute(message);
        } catch (err) {
            const eventId = this.client.logger.error(err, 'Error Running Chat Command', 'Commander');
            message.channel.send({ embeds: [new ErrorEmbed(eventId)] });
        }
    }
}
