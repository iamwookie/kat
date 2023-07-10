import { Command, KATClient as Client, Commander, MusicPrompts, NodeError, PlayerError, SearchError } from '@structures/index.js';
import { SlashCommandBuilder, ChatInputCommandInteraction, Message, GuildMember, VoiceChannel } from 'discord.js';
import { ActionEmbed, ErrorEmbed, MusicEmbed } from '@utils/embeds/index.js';

export class PlayCommand extends Command {
    constructor(client: Client, commander: Commander) {
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
            .setDescription(this.description?.content!)
            .setDMPermission(false)
            .addStringOption((option) => option.setName('query').setDescription('The name or URL of the track to search for.'));
    }

    async execute(int: ChatInputCommandInteraction<'cached'> | Message<true>) {
        const author = this.commander.getAuthor(int);
        const query = this.commander.getArgs(int).join(' ');

        const voiceChannel = (int.member as GuildMember).voice.channel;
        if (!voiceChannel) return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInVoice)] });
        if (!(voiceChannel instanceof VoiceChannel))
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.IncorrectVoice)] });
        if (!voiceChannel.joinable || !voiceChannel.speakable)
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.CannotPlayInVoice)] });

        if (!query) {
            const subscription = this.client.dispatcher.getSubscription(int.guild);
            if (!subscription?.paused) return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText('What should I play?')] });

            subscription.resume();
            return this.commander.react(int, '▶️');
        }

        this.applyCooldown(author);

        try {
            const res = await this.client.dispatcher.search(query, author);
            if (!res) return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NoResults)] });

            const subscription = await this.client.dispatcher.createSubscription(int.guild, voiceChannel, int.channel!);
            subscription.add(res);

            // Could use an empty flag for this in the future
            if (subscription.queue.length) return this.commander.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setEnqueued(res)] });

            this.commander.react(int, '✅');
        } catch (err) {
            if (err instanceof NodeError) {
                return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NoNodes)] });
            } else if (err instanceof SearchError && err.code == 1) {
                return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(`Failed to load track! \n\`${err.message}\``)] });
            } else if (err instanceof PlayerError) {
                return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.VoiceError)] });
            } else {
                const eventId = this.client.logger.error(err);
                return this.commander.reply(int, { embeds: [new ErrorEmbed(eventId)] });
            }
        }
    }
}
