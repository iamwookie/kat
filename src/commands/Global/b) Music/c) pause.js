const { MusicEmbed } = require('@utils/other/embeds');

module.exports = {
    name: 'pause',
    group: 'Music',
    description: 'Pause the track.',
    cooldown: 5,
    guildOnly: true,
    async run(client, msg, args) {
        let subscription = client.subscriptions.get(msg.guildId)
        if (!subscription || !subscription.isPlayerPlaying()) {
            let embed = new MusicEmbed(client, msg).setTitle('I\'m not playing anything!');
            return msg.reply({ embeds: [embed] }).catch(() => msg.channel.send({ embeds: [embed] }));
        }

        try {
            let track = subscription.playing;
            subscription.pause()

            let embed = new MusicEmbed(client, msg, 'paused', track);
            return msg.reply({ embeds: [embed] }).catch(() => msg.channel.send({ embeds: [embed] }));
        } catch(err) {
            return console.error(err)
        }
    }
};