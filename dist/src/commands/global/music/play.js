import { Command } from "../../../structures/index.js";
import { SlashCommandBuilder } from "discord.js";
import { Subscription as MusicSubscription, YouTubeTrack } from "../../../structures/index.js";
import { ActionEmbed, ErrorEmbed, MusicEmbed } from "../../../utils/embeds/index.js";
import play from "play-dl";
export class PlayCommand extends Command {
    constructor(commander) {
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
            .setDescription(this.description?.content)
            .setDMPermission(false)
            .addStringOption((option) => {
            option.setName("query")
                .setDescription("The name or URL of the track.");
            return option;
        });
    }
    async execute(client, int) {
        const query = int.options.getString("query");
        const voiceChannel = int.member?.voice.channel;
        if (!voiceChannel)
            return int.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc("You are not in a voice channel!")] });
        if (!voiceChannel.joinable || !voiceChannel.speakable)
            return await int.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc("I can't play in that voice channel!")] });
        let subscription = client.subscriptions.get(int.guildId);
        if (!query && subscription && subscription.paused) {
            subscription.resume();
            return int.editReply({ embeds: [new MusicEmbed(subscription).setUser(int.user).setPlaying(subscription.active)] });
        }
        if (!query)
            return int.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc("What should I play?")] });
        if (!subscription) {
            try {
                subscription = await MusicSubscription.create(client, int.guild, voiceChannel, int.channel);
            }
            catch (err) {
                const eventId = client.logger.error(err);
                return await int.editReply({ embeds: [new ErrorEmbed(eventId)] });
            }
        }
        const res = await subscription.node.rest.resolve('ytsearch:' + query);
        switch (res?.loadType) {
            case "LOAD_FAILED": {
                await int.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc(`Failed to load track! \n\`${res.exception?.message}\``)] });
                break;
            }
            case "NO_MATCHES": {
                await int.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc("Could not find your search result!")] });
                break;
            }
            case "SEARCH_RESULT": {
                const info = await play.video_info(res.tracks[0].info.uri);
                const track = new YouTubeTrack(res.tracks[0], info, int, {
                    onError: () => int.channel?.send({ embeds: [new ActionEmbed('fail').setUser(int.user).setDesc("An error occured while playing the track. Skipping!")] }),
                });
                subscription.add(track);
                await int.editReply({ embeds: [new MusicEmbed(subscription).setUser(int.user).setEnqueued(track)] });
                break;
            }
        }
        return Promise.resolve();
    }
}
