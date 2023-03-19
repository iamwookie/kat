import { EmbedBuilder } from "discord.js";
import { getServiceIcon, createProgressBar } from "../helpers.js";
export class MusicEmbed extends EmbedBuilder {
    client;
    guild;
    author;
    item;
    constructor(interaction) {
        super();
        this.client = interaction.client;
        this.guild = interaction.guild;
        this.author = interaction.user;
        this.setColor("#C167ED");
        this.setFooter({ text: `${this.guild?.name} | 🎵 ${this.client.user?.username} Global Music System`, iconURL: this.guild?.iconURL() });
    }
    setItem(item) {
        this.item = item;
        this.setAuthor({ name: "requestedBy" in this.item ? `Requested By: ${this.item.requestedBy.tag}` : this.author.tag, iconURL: this.author.avatarURL() ?? undefined });
        if (this.item?.thumbnail)
            this.setThumbnail(this.item?.thumbnail.url);
        return this;
    }
    setEnqueued(subscription) {
        if (!this.item)
            return this;
        if (this.item?.type == "playlist" || this.item?.type == "album") {
            this.item = this.item;
            const name = this.item.title ?? this.item.name;
            const trackCount = this.item.videoCount ?? this.item.tracksCount;
            this.addFields({ name: "Enqueued:", value: `\`${trackCount}\` tracks from ${getServiceIcon(this.item)} [\`${name}\`](${this.item.url})` });
        }
        else {
            this.item = this.item;
            this.addFields({
                name: "Enqueued:",
                value: `\`${subscription?.queue.length == 0 ? 1 : subscription?.queue.length}.\` - ${getServiceIcon(this.item)} [\`${this.item?.title} [${this.item?.duration}]\`](${this.item?.url})`,
            });
        }
        return this;
    }
    setPlaying(subscription) {
        if (subscription.active) {
            const track = subscription.active;
            const progressBar = createProgressBar("playbackDuration" in subscription.player.state ? subscription.player.state.playbackDuration : 0, track.durationRaw);
            this.addFields({ name: "Now Playing:", value: `${getServiceIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})\n${progressBar}` });
            this.setItem(track);
        }
        return this;
    }
    setPaused(subscription) {
        if (subscription.active) {
            const track = subscription.active;
            const progressBar = createProgressBar("playbackDuration" in subscription.player.state ? subscription.player.state.playbackDuration : 0, track.durationRaw);
            this.addFields({ name: "Paused Track:", value: `${getServiceIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})\n${progressBar}` });
            this.setItem(track);
        }
        return this;
    }
    setResumed(subscription) {
        if (subscription.active) {
            const track = subscription.active;
            const progressBar = createProgressBar("playbackDuration" in subscription.player.state ? subscription.player.state.playbackDuration : 0, track.durationRaw);
            this.addFields({ name: "Resumed Track:", value: `${getServiceIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})\n${progressBar}` });
            this.setItem(track);
        }
        return this;
    }
    setSkipped(subscription) {
        if (subscription.active) {
            const track = subscription.active;
            this.addFields({ name: "Skipped Track:", value: `${getServiceIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})` });
            this.setItem(track);
        }
        return this;
    }
    setQueue(subscription) {
        if (subscription.queue.length) {
            let res = "";
            for (const [index, track] of subscription.queue.entries()) {
                if (res.length >= 840)
                    return this.addFields({ name: "Server Queue:", value: `${res}...` });
                res += `\`${index + 1}.\` - ${getServiceIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})\n`;
            }
            this.addFields({ name: "Server Queue:", value: `${res}` });
        }
        return this;
    }
}
