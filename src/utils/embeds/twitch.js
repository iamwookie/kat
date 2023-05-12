import { EmbedBuilder } from 'discord.js';
export class TwitchEmbed extends EmbedBuilder {
    constructor(user, stream, image) {
        super();
        super
            .setColor('#9146ff')
            .setImage(image)
            .setAuthor({
            name: `${stream.userDisplayName} is NOW LIVE!!`,
            iconURL: user.profilePictureUrl,
            url: `https://www.twitch.tv/${user.name}`,
        })
            .setTitle(stream.title)
            .setURL(`https://www.twitch.tv/${user.name}`)
            .addFields([
            { name: 'Playing', value: stream.gameName, inline: true },
            { name: 'Viewers', value: stream.viewers.toString(), inline: true },
            {
                name: '-----------------------------------------------------------',
                value: `[Click here to watch now!](https://www.twitch.tv/${user.name})`,
            },
        ]);
    }
}
