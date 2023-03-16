import { Commander, CommanderCommand } from "@src/commander/index.js";

import { Client, ChatInputCommandInteraction, GuildMember, TextChannel, VoiceBasedChannel, VoiceChannel } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { joinVoiceChannel } from "@discordjs/voice";

import play from "play-dl";
import { MusicSubscription, YouTubeTrack, SpotifyTrack } from "@lib/music/index.js";
import { ActionEmbed, ErrorEmbed, MusicEmbed } from "@src/utils/embeds/index.js";

import chalk from "chalk";

export class PlayCommand extends CommanderCommand {
    constructor(commander: Commander) {
        super(commander);

        this.name = "play";
        this.group = "Music";
        this.description = "Search for a track and play it or add it to the queue.";
        this.format = "<?search/url>";

        this.data = () => {
            return new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description!)
                .setDMPermission(false)
                .addStringOption((option) => {
                    option.setName("query");
                    option.setDescription("The name or URL of the track.");
                    return option;
                });
        };

        this.execute = async (client: Client, int: ChatInputCommandInteraction) => {
            const query = int.options.getString("query");

            const voiceChannel: VoiceBasedChannel | null = (int.member as GuildMember)?.voice.channel;
            if (!voiceChannel) return int.editReply({ embeds: [new ActionEmbed("fail", "You are not in a voice channel!", int.user)] });
            if (!voiceChannel.joinable || !(voiceChannel as VoiceChannel).speakable) return int.editReply({ embeds: [new ActionEmbed("fail", "I can't play in that voice channel!", int.user)] });

            let subscription: MusicSubscription = client.subscriptions.get(int.guildId);

            if (subscription && subscription.isPlayerPaused) {
                subscription.unpause();

                const resumed = new MusicEmbed(int).setResumed(subscription).setQueue(subscription);
                if (!query) return int.editReply({ embeds: [resumed] });

                (int.channel as TextChannel)?.send({ embeds: [resumed] });
            }

            if (!query) return int.editReply({ embeds: [new ActionEmbed("fail", "What should I play?", int.user)] });

            if (!subscription) {
                try {
                    subscription = new MusicSubscription(
                        client,
                        joinVoiceChannel({
                            channelId: voiceChannel.id,
                            guildId: voiceChannel.guild.id,
                            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                        }),
                        voiceChannel,
                        int.channel
                    );

                    client.subscriptions.set(voiceChannel.guild.id, subscription);
                    client.logger.info(chalk.green(`Music >> Subscription Created: ${subscription.guild?.name} (${subscription.guild?.id})`));
                } catch (err) {
                    client.logger.error(err);
                    console.error("Music (ERROR) >> Error Creating Subscription");
                    console.error(err);
                }
            }

            try {
                if (query.startsWith("https://open.spotify.com/")) {
                    try {
                        if (play.is_expired()) await play.refreshToken();

                        const search = await play.spotify(query);

                        if (search instanceof play.SpotifyTrack) {
                            const track = new SpotifyTrack(subscription, int, search, {
                                onError: () => (int.channel as TextChannel)?.send({ embeds: [new ActionEmbed("fail", "An error occured while playing a track!", int.user)] }),
                            });
                            subscription.add(track);

                            return int.editReply({ embeds: [new MusicEmbed(int).setItem(track).setEnqueued(subscription)] });
                        } else if (search instanceof play.SpotifyPlaylist || search instanceof play.SpotifyAlbum) {
                            const spotifyTracks = await search.all_tracks();

                            for (const item of spotifyTracks) {
                                const track = new SpotifyTrack(subscription, int, item, {
                                    onError: () => (int.channel as TextChannel)?.send({ embeds: [new ActionEmbed("fail", "An error occured while playing a track!", int.user)] }),
                                });
                                subscription.add(track);
                            }

                            return int.editReply({ embeds: [new MusicEmbed(int).setItem(search).setEnqueued(subscription)] });
                        } else {
                            int.editReply({ embeds: [new ActionEmbed("fail", "You have not provided a valid Spotify URL!", int.user)] });

                            return subscription.destroy();
                        }
                    } catch (err) {
                        client.logger.error(err);
                        int.editReply({ embeds: [new ActionEmbed("fail", "You have not provided a valid Spotify URL!", int.user)] });

                        return subscription.destroy();
                    }
                } else if (query.startsWith("https://www.youtube.com/playlist" || "https://youtube.com/playlist")) {
                    try {
                        const search = await play.playlist_info(query, { incomplete: true });

                        if (search instanceof play.YouTubePlayList) {
                            for (const video of (search as any).videos) {
                                const track = new YouTubeTrack(subscription, int, video, {
                                    onError: () => (int.channel as TextChannel)?.send({ embeds: [new ActionEmbed("fail", "An error occured while playing a track!", int.user)] }),
                                });
                                subscription.add(track);
                            }

                            return int.editReply({ embeds: [new MusicEmbed(int).setItem(search).setEnqueued(subscription)] });
                        } else {
                            int.editReply({ embeds: [new ActionEmbed("fail", "Couldn't find your search result. Try again!", int.user)] });

                            return subscription.destroy();
                        }
                    } catch (err) {
                        client.logger.error(err);
                        int.editReply({ embeds: [new ActionEmbed("fail", "Couldn't find your search result. Try again!", int.user)] });

                        return subscription.destroy();
                    }
                } else {
                    try {
                        const search = await play.search(query, { limit: 1, source: { youtube: "video" } });

                        if (search[0] instanceof play.YouTubeVideo) {
                            const track = new YouTubeTrack(subscription, int, search[0], {
                                onError: () => (int.channel as TextChannel)?.send({ embeds: [new ActionEmbed("fail", "An error occured while playing a track!", int.user)] }),
                            });
                            subscription.add(track);

                            return int.editReply({ embeds: [new MusicEmbed(int).setItem(track).setEnqueued(subscription)] });
                        } else {
                            int.editReply({ embeds: [new ActionEmbed("fail", "Couldn't find your search result. Try again!", int.user)] });

                            return subscription.destroy();
                        }
                    } catch (err) {
                        client.logger.error(err);
                        int.editReply({ embeds: [new ActionEmbed("fail", "Couldn't find your search result. Try again!", int.user)] });

                        return subscription.destroy();
                    }
                }
            } catch (err) {
                const eventId = client.logger.error(err);
                console.error(chalk.red("Music Commands (ERROR) >> play: Error Running Command"));
                console.error(err);

                return int.editReply({ embeds: [new ErrorEmbed(eventId)] });
            }
        };
    }
}
