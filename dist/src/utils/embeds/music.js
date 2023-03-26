import { EmbedBuilder } from "discord.js";
import { getServiceIcon, createProgressBar } from "../helpers.js";
export class MusicEmbed extends EmbedBuilder {
    subscription;
    constructor(subscription) {
        super();
        this.subscription = subscription;
        this.subscription = subscription;
        super.setFooter({ text: `🎵 ${this.subscription.node.name}` });
    }
    setUser(user) {
        return super.setAuthor({ name: `Requested By: ${user.tag}`, iconURL: user.avatarURL() ?? undefined });
    }
    setEnqueued(item) {
        if (!item)
            return this;
        if (item.thumbnail)
            super.setThumbnail(item.thumbnail.url);
        return super.addFields({
            name: "Enqueued:",
            value: `\`${this.subscription.queue.length == 0 ? 1 : this.subscription.queue.length}.\` - ${getServiceIcon(item)} [\`${item.title} [${item.duration}]\`](${item.url})`,
        });
    }
    setPlaying(item) {
        if (!item)
            return this;
        if (item.thumbnail)
            super.setThumbnail(item.thumbnail.url);
        return super.addFields({
            name: "Now Playing:",
            value: `${getServiceIcon(item)} [\`${item.title} [${item.duration}]\`](${item.url})\n${createProgressBar(this.subscription.duration, item.durationRaw)}`,
        });
    }
    setPaused(item) {
        if (!item)
            return this;
        if (item.thumbnail)
            super.setThumbnail(item.thumbnail.url);
        return super.addFields({
            name: "Paused Track:",
            value: `${getServiceIcon(item)} [\`${item.title} [${item.duration}]\`](${item.url})\n${createProgressBar(this.subscription.player.position, item.durationRaw)}`,
        });
    }
    setSkipped(item) {
        if (!item)
            return this;
        return super.addFields({ name: "Skipped:", value: `${getServiceIcon(item)} [\`${item.title} [${item.duration}]\`](${item.url})` });
    }
    setQueue(queue) {
        if (!queue.length)
            return this;
        let res = "";
        for (const [index, track] of queue.entries()) {
            if (res.length >= 840)
                return this.addFields({ name: "Server Queue:", value: `${res}...` });
            res += `\`${index + 1}.\` - ${getServiceIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})\n`;
        }
        return super.addFields({ name: "Server Queue:", value: `${res}` });
    }
}
