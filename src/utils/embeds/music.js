import { EmbedBuilder } from "discord.js";
import { YouTubePlaylist, SpotifyPlaylist } from "../../structures/index.js";
import { getServiceIcon } from "../helpers.js";
export class MusicEmbed extends EmbedBuilder {
    subscription;
    constructor(subscription) {
        super();
        this.subscription = subscription;
        super.setDescription("```⚠️ Track links have been removed temporarily due to a bug with Discord.```");
        super.setFooter({ text: `🎵 ${this.subscription.node.name}` });
    }
    setUser(user) {
        return super.setFooter({ text: `${user.tag} \u200b • \u200b 🎵 ${this.subscription.node.name}`, iconURL: user.avatarURL() ?? undefined });
    }
    setEnqueued(item) {
        if (!item)
            return this;
        if (item.thumbnail)
            super.setThumbnail(item.thumbnail);
        if (item instanceof YouTubePlaylist || item instanceof SpotifyPlaylist) {
            return super.addFields({
                name: "Enqueued:",
                value: `${getServiceIcon(item)} \`${item.tracks.length}\` tracks from \`${item.title}\``,
            });
        }
        else {
            return super.addFields({
                name: "Enqueued:",
                value: `\`${this.subscription.queue.length == 0 ? 1 : this.subscription.queue.length}.\` - ${getServiceIcon(item)} \`${item.title} [${item.duration}]\``,
            });
        }
    }
    setPlaying(item) {
        if (!item)
            return this;
        if (item.thumbnail)
            super.setThumbnail(item.thumbnail);
        return super.addFields({
            name: "Now Playing:",
            value: `${this.subscription.looped ? "🔁 - " : ""}${getServiceIcon(item)} \`${item.title} [${item.duration}]\``,
        });
    }
    setPaused(item) {
        if (!item)
            return this;
        if (item.thumbnail)
            super.setThumbnail(item.thumbnail);
        return super.addFields({
            name: "Paused Track:",
            value: `${getServiceIcon(item)} \`${item.title} [${item.duration}]\``,
        });
    }
    setSkipped(item) {
        if (!item)
            return this;
        return super.addFields({ name: "Skipped:", value: `${getServiceIcon(item)} \`${item.title} [${item.duration}]\`` });
    }
    setLooped(item) {
        if (!item)
            return this;
        return super
            .setColor(this.subscription.looped ? "Green" : "Red")
            .addFields({ name: `Track ${this.subscription.looped ? "Looped" : "Un-looped"}:`, value: `${getServiceIcon(item)} \`${item.title} [${item.duration}]\`` });
    }
    setQueue(queue) {
        if (!queue.length)
            return this;
        let res = "";
        for (const [index, track] of queue.entries()) {
            if (res.length >= 840)
                return super.addFields({ name: "Server Queue:", value: `${res}+ \`${queue.length - index}\` more...` });
            res += `\`${index + 1}.\` - ${getServiceIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})\n`;
        }
        return super.addFields({ name: "Server Queue:", value: `${res}` });
    }
}
