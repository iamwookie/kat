!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="d9ff8211-e831-5fed-b0f2-72b79d98db25")}catch(e){}}();
import { EmbedBuilder } from 'discord.js';
import { YouTubePlaylist, SpotifyPlaylist } from '../../structures/index.js';
import { getServiceIcon } from '../helpers.js';
export class MusicEmbed extends EmbedBuilder {
    subscription;
    constructor(subscription) {
        super();
        this.subscription = subscription;
        super.setColor('White');
        super.setFooter({ text: `🎵 ${this.subscription.node.name}` });
    }
    setUser(user) {
        return super.setFooter({
            text: `${user.tag.replace('#0', '')} \u200b • \u200b 🎵 ${this.subscription.node.name}`,
            iconURL: user.avatarURL() ?? undefined,
        });
    }
    setEnqueued(item) {
        if (!item)
            return this;
        if (item.thumbnail)
            super.setThumbnail(item.thumbnail);
        if (item instanceof YouTubePlaylist || item instanceof SpotifyPlaylist) {
            return super.addFields({
                name: 'Enqueued:',
                value: `${getServiceIcon(item)} \`${item.tracks.length}\` tracks from [\`${item.title}\`](${item.url})`,
            });
        }
        else {
            return super.addFields({
                name: 'Enqueued:',
                value: `\`${this.subscription.position + this.subscription.queue.length}.\` - ${getServiceIcon(item)} [\`${item.title} [${item.duration}]\`](${item.url})`,
            });
        }
    }
    setPlaying(item) {
        if (!item)
            return this;
        if (item.thumbnail)
            super.setThumbnail(item.thumbnail);
        return super.addFields({
            name: 'Now Playing:',
            value: `\`${this.subscription.position}.\` - ${this.subscription.paused ? '⏸️ - ' : ''}${this.subscription.looped ? '🔁 - ' : ''}${getServiceIcon(item)} [\`${item.title} [${item.duration}]\`](${item.url})`,
        });
    }
    setQueue(queue) {
        if (!queue.length)
            return this;
        let res = '';
        for (const [index, track] of queue.entries()) {
            if (res.length >= 840)
                return super.addFields({ name: 'Server Queue:', value: `${res}+ \`${queue.length - index}\` more...` });
            res += `\`${this.subscription.position + index + 1}.\` - ${getServiceIcon(track)} [\`${track.title} [${track.duration}]\`](${track.url})\n`;
        }
        return super.addFields({ name: 'Server Queue:', value: `${res}` });
    }
}
//# debugId=d9ff8211-e831-5fed-b0f2-72b79d98db25
//# sourceMappingURL=music.js.map
