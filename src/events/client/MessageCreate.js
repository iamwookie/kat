!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="5d5c5e07-c78a-5861-b5ad-143f9766bd0f")}catch(e){}}();
import { Event } from '../../structures/index.js';
import { EmbedBuilder, Events } from 'discord.js';
export class MessageCreate extends Event {
    constructor(client, commander) {
        super(client, commander, Events.MessageCreate);
    }
    async execute(message) {
        if (message.author.bot)
            return;
        const prefix = this.client.prefix;
        if (!message.content.startsWith(this.client.prefix))
            return;
        const commandName = message.content.slice(prefix.length).split(/ +/).shift()?.toLowerCase();
        const command = this.commander.commands.get(commandName) ?? this.commander.commands.get(this.commander.aliases.get(commandName));
        if (!command || command.disabled)
            return;
        try {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setTitle("We're Moving!")
                .setDescription('In order for KAT to get verified as an official bot on Discord, chat commands have moved to slash commands! Please use `/help` to see a list of commands.');
            await message.reply({ embeds: [embed] });
        }
        catch (err) {
            const eventId = this.client.logger.error(err, 'Error Running Chat Command', 'Commander');
        }
    }
}
//# debugId=5d5c5e07-c78a-5861-b5ad-143f9766bd0f
//# sourceMappingURL=MessageCreate.js.map
