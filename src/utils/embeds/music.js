!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="4ab178a6-634b-568a-97aa-fa706dc0b5bc")}catch(e){}}();
import { EmbedBuilder } from 'discord.js';
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
//# debugId=4ab178a6-634b-568a-97aa-fa706dc0b5bc
//# sourceMappingURL=music.js.map
