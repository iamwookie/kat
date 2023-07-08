!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="0c040bd8-41bd-55f6-ac94-3437cd5caffe")}catch(e){}}();
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
        let prefix = this.client.isDev(message.author) ? this.client.devPrefix : this.client.prefix;
        if (!this.client.isDev(message.author) && message.inGuild())
            prefix = await this.client.cache.guilds.prefix(message.guild.id);
        if (!message.content.startsWith(prefix))
            return;
        const commandName = message.content.slice(prefix.length).split(/ +/).shift()?.toLowerCase();
        const command = this.commander.commands.get(commandName) ?? this.commander.commands.get(this.commander.aliases.get(commandName));
        if (!command || command.disabled || !command.legacy)
            return;
        if (!command.allowDM && !message.inGuild())
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
//# debugId=0c040bd8-41bd-55f6-ac94-3437cd5caffe
//# sourceMappingURL=MessageCreate.js.map
