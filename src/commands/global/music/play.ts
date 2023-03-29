import { KATClient as Client, Commander, Command } from "@structures/index.js";
import { SlashCommandBuilder, ChatInputCommandInteraction, Message, GuildMember, VoiceBasedChannel, VoiceChannel } from "discord.js";
import { Subscription as MusicSubscription, YouTubeTrack } from "@structures/index.js";
import { ActionEmbed, ErrorEmbed, MusicEmbed } from "@src/utils/embeds/index.js";

export class PlayCommand extends Command {
    constructor(commander: Commander) {
        super(commander);

        this.name = "play";
        this.group = "Music";
        this.description = {
            content: "Search for a track and add it to the queue or resume the current track.",
            format: "<?title/url>",
        };

        this.cooldown = 5;
    }

    data() {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description?.content!)
        .setDMPermission(false)
        .addStringOption((option) => {
            option.setName("query")
            .setDescription("The name or URL of the track.");
            return option;
        });
    }

    async execute(client: Client, int: ChatInputCommandInteraction | Message) {
        const author = this.getAuthor(int)!
        const query = this.getArgs(int).join(" ");

        const voiceChannel: VoiceBasedChannel | null = (int.member as GuildMember).voice.channel;
        if (!voiceChannel) return this.reply(int, { embeds: [new ActionEmbed("fail").setUser(author).setDesc("You are not in a voice channel!")] });
        if (!voiceChannel.joinable || !(voiceChannel as VoiceChannel).speakable) return this.reply(int, { embeds: [new ActionEmbed("fail").setUser(author).setDesc("I can't play in that voice channel!")] });

        let subscription: MusicSubscription = client.subscriptions.get(int.guildId);

        if (!query && subscription && subscription.paused) {
            subscription.resume();
            return this.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setPlaying(subscription.active)] });
        }

        if (!query) return this.reply(int, { embeds: [new ActionEmbed("fail").setUser(author).setDesc("What should I play?")] });

        if (!subscription) {
            try {
                subscription = await MusicSubscription.create(client, int.guild!, voiceChannel, int.channel);
            } catch (err) {
                const eventId = client.logger.error(err)
                return this.reply(int, { embeds: [new ErrorEmbed(eventId)] });
            }
        }

        const res = await subscription.node.rest.resolve('ytsearch:' + query);
        
        switch (res?.loadType) {
            case "LOAD_FAILED": {
                await this.reply(int, { embeds: [new ActionEmbed("fail").setUser(author).setDesc(`Failed to load track! \n\`${res.exception?.message}\``)] });
                break;
            }
            case "NO_MATCHES": {
                await this.reply(int, { embeds: [new ActionEmbed("fail").setUser(author).setDesc("Could not find your search result!")] });
                break;
            }
            case "SEARCH_RESULT": {
                const track = new YouTubeTrack(res.tracks[0], author, int.channel, {
                    onError: () => int.channel?.send({ embeds: [new ActionEmbed('fail').setUser(author).setDesc("An error occured while playing the track. Skipping!")] }),
                });

                subscription.add(track);

                await this.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setEnqueued(track)] });
                break;
            }
        }
    }
}
