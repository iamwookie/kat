import { EmbedBuilder } from 'discord.js';
import { HelixUser, HelixStream } from '@twurple/api';

export class TwitchEmbed extends EmbedBuilder {
    constructor(user: HelixUser, stream: HelixStream, image: string) {
        super();

        this.setColor('#9146ff');
        this.setImage(image);
        this.setAuthor({ name: `${stream.userDisplayName} is NOW LIVE!!`, iconURL: user.profilePictureUrl, url: `https://www.twitch.tv/${user.name}` });
        this.setTitle(stream.title);
        this.setURL(`https://www.twitch.tv/${user.name}`);
        this.addFields([
            { name: 'Playing', value: stream.gameName, inline: true },
            { name: 'Viewers', value: stream.viewers.toString(), inline: true },
            { name: '-----------------------------------------------------------', value: `[Click here to watch now!](https://www.twitch.tv/${user.name})` }
        ]);
    }
}