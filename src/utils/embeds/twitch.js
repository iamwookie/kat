const { EmbedBuilder } = require('discord.js');

class TwitchEmbed extends EmbedBuilder {
    constructor(user, stream, image) {
        super();

        this.setColor('#9146ff');
        this.setImage(image);
        this.setAuthor({ name: `${stream.userDisplayName} is NOW LIVE!!`, iconURL: user.profilePictureUrl, URL: `https://www.twitch.tv/${user.name}` });
        this.setTitle(stream.title);
        this.setURL(`https://www.twitch.tv/${user.name}`);
        this.addFields([
            { name: 'Playing', value: stream.gameName, inline: true },
            { name: 'Viewers', value: stream.viewers.toString(), inline: true },
            { name: '-----------------------------------------------------------', value: `[Click here to watch now!](https://www.twitch.tv/${user.name})` }
        ]);
    }
}

module.exports = TwitchEmbed;