const Discord = require('discord.js');
const Commander = require('@root/commander');
const TwitchManager = require('@core/twitch/twitchmanager');
const { successEmbed, failEmbed, loadEmbed } = require('@utils/other/embeds');
// -----------------------------------
const channels = [
    '361595279218311173',
    '823602114374402048'
]

module.exports = {
    name: 'live',
    group: 'Twitch',
    description: 'Send live stream announcement.',
    hidden: true,
    
    // AUTHORIZATION
    guilds: ['348849020103426059', '729660181226455160'],
    users: ['182543450753728524'],
    
    async run(client, msg) {
        let wait = loadEmbed('Searching...', msg.author);

        await msg.delete();

        msg.channel.send({embeds: [wait]}).then(async waitMessage => {
            TwitchManager.initialize(client);

            let stream = await client.twitch.getStreamByUserName('bigmongostyler');

            if (!stream) {
                let fail = failEmbed('You are not streaming!', msg.author);
                return waitMessage.edit({embeds: [fail]}).then((msg) => setTimeout(() => msg.delete(), 5000));
            }

            let user = await stream.getUser();
            let imageURL = await stream.getThumbnailUrl(1280, 720);

            let embed = new Discord.MessageEmbed()
            .setColor('#9146ff')
            .setAuthor({ name: `${stream.userDisplayName} is NOW LIVE!!`, iconURL: user.profilePictureUrl, URL: `https://www.twitch.tv/${user.name}` })
            .setTitle(stream.title)
            .setURL(`https://www.twitch.tv/${user.name}`)
            .addFields(
                { name: 'Playing', value: stream.gameName, inline: true },
                { name: 'Viewers', value: stream.viewers.toString(), inline: true },
                { name: '-----------------------------------------------------------', value: `[Click here to watch now!](https://www.twitch.tv/${user.name})` }
            )
            .setImage(imageURL);

            for (const channelid of channels) {
                try {
                    let channel = await client.channels.fetch(channelid);
                    if (channel) channel.send({ content: "@everyone", embeds: [embed] });
                } catch (err) {
                    Commander.handleError(client, err, false);
                    console.error(`Guild Commands (ERROR) (${this.guilds[0]}) >> live: Failed To Fetch Channel`.red); 
                    console.error(err);
                    
                    let fail = failEmbed('Failed to send message(s)!');
                    return waitMessage.edit({ embeds: [fail] }).then(msg => setTimeout(() => msg.delete(), 5000));
                }
            }

            let success = successEmbed('Message(s) sent!', msg.author);
            waitMessage.edit({ embeds: [success] }).then(msg => setTimeout(() => msg.delete(), 5000));
        });
    }
};