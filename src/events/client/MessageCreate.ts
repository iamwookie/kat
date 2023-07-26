import { Event, KATClient as Client, Commander } from '@structures/index.js';
import { EmbedBuilder, Events, Message } from 'discord.js';

export class MessageCreate extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.MessageCreate);
    }

    async execute(message: Message) {
        if (message.author.bot) return;

        const prefix = this.client.prefix;
        if (!message.content.startsWith(this.client.prefix)) return;

        const commandName = message.content.slice(prefix.length).split(/ +/).shift()?.toLowerCase() as string;
        const command = this.commander.commands.get(commandName) ?? this.commander.commands.get(this.commander.aliases.get(commandName)!);
        if (!command || command.disabled) return;

        try {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setTitle("We're Moving!")
                .setDescription(
                    'In order for KAT to get verified as an official bot on Discord, chat commands have moved to slash commands! Please use `/help` to see a list of commands.'
                );

            await message.reply({ embeds: [embed] });
        } catch (err) {
            const eventId = this.client.logger.error(err, 'Error Running Chat Command', 'Commander');
        }
    }
}
