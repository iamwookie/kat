import { EmbedBuilder, User } from 'discord.js';
import { Subscription as MusicSubscription, YouTubeTrack, SpotifyTrack, YouTubePlaylist, SpotifyPlaylist } from '@structures/index.js';
import { getServiceIcon } from '../helpers.js';

export class MusicEmbed extends EmbedBuilder {
    constructor(private subscription: MusicSubscription) {
        super();

        super.setColor('White');
        super.setFooter({ text: `🎵 ${this.subscription.node.name}` });
    }

    setUser(user: User) {
        return super.setFooter({
            text: `${user.tag.replace('#0', '')} \u200b • \u200b 🎵 ${this.subscription.node.name}`,
            iconURL: user.avatarURL() ?? undefined,
        });
    }

    setPlaying(item: YouTubeTrack | SpotifyTrack | null) {
        if (!item) return this;

        if (item.thumbnail) super.setThumbnail(item.thumbnail);
        return super.addFields({
            name: 'Now Playing:',
            value: `\`${this.subscription.position}.\` - ${this.subscription.paused ? '⏸️ - ' : ''}${
                this.subscription.looped ? '🔁 - ' : ''
            }${getServiceIcon(item)} [\`${item.title} [${item.duration}]\`](${item.url})`,
        });
    }

    setQueue(queue: (YouTubeTrack | SpotifyTrack)[]) {
        if (!queue.length) return this;

        let res = '';
        for (const [index, track] of queue.entries()) {
            if (res.length >= 840) return super.addFields({ name: 'Server Queue:', value: `${res}+ \`${queue.length - index}\` more...` });
            res += `\`${this.subscription.position + index + 1}.\` - ${getServiceIcon(track)} [\`${track.title} [${track.duration}]\`](${
                track.url
            })\n`;
        }

        return super.addFields({ name: 'Server Queue:', value: `${res}` });
    }
}
