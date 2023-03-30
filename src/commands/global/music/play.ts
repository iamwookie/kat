import { KATClient as Client, Commander, Command } from "@structures/index.js";
import { SlashCommandBuilder, ChatInputCommandInteraction, Message, GuildMember, VoiceBasedChannel, VoiceChannel } from "discord.js";
import { Subscription as MusicSubscription, YouTubeTrack, SpotifyTrack } from "@structures/index.js";
import { LavalinkResponse } from "shoukaku";
import { ActionEmbed, MusicEmbed } from "@src/utils/embeds/index.js";

export class PlayCommand extends Command {
    constructor(commander: Commander) {
        super(commander);

        this.name = "play";
        this.group = "Music";
        this.legacyAliases = ["p"];
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
        if (!voiceChannel) return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("You are not in a voice channel!")] });
        if (!voiceChannel.joinable || !(voiceChannel as VoiceChannel).speakable) return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("I can't play in that voice channel!")] });

        let subscription: MusicSubscription = client.subscriptions.get(int.guildId);

        if (!query && subscription && subscription.paused) {
            this.applyCooldown(author);
            
            subscription.resume();
            return this.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setPlaying(subscription.active)] });
        }

        if (!query) return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("What should I play?")] });

        this.applyCooldown(author);

        if (!subscription) {
            try {
                subscription = await MusicSubscription.create(client, int.guild!, voiceChannel, int.channel);
            } catch (err) {
                client.logger.error(err)
                return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("No nodes are available to play music right now!")] });
            }
        }

        let res: LavalinkResponse | null;

        try {
            const url = new URL(query);
            res = await subscription.node.rest.resolve(url.href);

        } catch (err) {
            res = await subscription.node.rest.resolve("ytsearch:" + query);
        }

        switch (res?.loadType) {
            case "LOAD_FAILED": {
                this.reply(int, { embeds: [new ActionEmbed("fail").setDesc(`Failed to load track! \n\`${res.exception?.message}\``)] });
                break;
            }
            case "NO_MATCHES": {
                this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("Could not find your search result!")] });
                break;
            }
            case "SEARCH_RESULT": {
                const data = res.tracks[0];
                const track = new YouTubeTrack(client, data, author, int.channel);
                subscription.add(track);

                this.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setEnqueued(track)] });
                break;
            }
            case "TRACK_LOADED": {
                const data = res.tracks[0];

                switch (data.info.sourceName) {
                    case "youtube": {
                        const track = new YouTubeTrack(client, data, author, int.channel);
                        subscription.add(track);
                        this.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setEnqueued(track)] });
                        break;
                    }
                    case "spotify": {
                        const track = new SpotifyTrack(client, data, author, int.channel);
                        subscription.add(track);
                        this.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setEnqueued(track)] });
                        break;
                    }
                    default: {
                        this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("Could not find your search result!")] });
                        break;
                    }
                }

                break;
            }
            default: {
                this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("Could not find your search result!")] });
                break;
            }
        }
    }
}
