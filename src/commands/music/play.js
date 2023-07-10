!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="f6bfe987-dda0-54b7-94de-5dba323bb456")}catch(e){}}();
import { Command, MusicPrompts, NodeError, PlayerError, SearchError } from '../../structures/index.js';
import { SlashCommandBuilder, VoiceChannel } from 'discord.js';
import { ActionEmbed, ErrorEmbed, MusicEmbed } from '../../utils/embeds/index.js';
export class PlayCommand extends Command {
    constructor(client, commander) {
        super(client, commander, {
            name: 'play',
            module: 'Music',
            legacy: true,
            aliases: ['p'],
            description: {
                content: 'Add a track to the queue, or resume the current one.',
                format: '<?title/url>',
            },
            cooldown: 5,
            ephemeral: true,
        });
    }
    data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content)
            .setDMPermission(false)
            .addStringOption((option) => option.setName('query').setDescription('The name or URL of the track to search for.'));
    }
    async execute(int) {
        const author = this.commander.getAuthor(int);
        const query = this.commander.getArgs(int).join(' ');
        const voiceChannel = int.member.voice.channel;
        if (!voiceChannel)
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInVoice)] });
        if (!(voiceChannel instanceof VoiceChannel))
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.IncorrectVoice)] });
        if (!voiceChannel.joinable || !voiceChannel.speakable)
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.CannotPlayInVoice)] });
        if (!query) {
            const subscription = this.client.dispatcher.getSubscription(int.guild);
            if (!subscription?.paused)
                return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText('What should I play?')] });
            subscription.resume();
            return this.commander.react(int, '▶️');
        }
        this.applyCooldown(author);
        try {
            const res = await this.client.dispatcher.search(query, author);
            if (!res)
                return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NoResults)] });
            const subscription = await this.client.dispatcher.createSubscription(int.guild, voiceChannel, int.channel);
            subscription.add(res);
            // Could use an empty flag for this in the future
            if (subscription.queue.length)
                return this.commander.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setEnqueued(res)] });
            this.commander.react(int, '✅');
        }
        catch (err) {
            if (err instanceof NodeError) {
                return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NoNodes)] });
            }
            else if (err instanceof SearchError && err.code == 1) {
                return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(`Failed to load track! \n\`${err.message}\``)] });
            }
            else if (err instanceof PlayerError) {
                return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.VoiceError)] });
            }
            else {
                const eventId = this.client.logger.error(err);
                return this.commander.reply(int, { embeds: [new ErrorEmbed(eventId)] });
            }
        }
    }
}
//# debugId=f6bfe987-dda0-54b7-94de-5dba323bb456
//# sourceMappingURL=play.js.map
