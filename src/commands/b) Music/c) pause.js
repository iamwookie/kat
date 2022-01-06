const { MusicEmbed } = require('@utils/embeds');

module.exports = {
    name: 'pause',
    description: 'Pause the track.',
    group: 'Music',
    guildOnly: true,
    cooldown: 5,
    async run(client, msg, args) {
        let subscription = client.subscriptions.get(msg.guildId)
        if (!subscription) {
            let embed = new MusicEmbed(client, msg).setTitle('I\'m not playing anything!');
            return msg.reply({ embeds: [embed] });
        }

        try {
            let track = subscription.playing;
            subscription.pause()

            let embed = new MusicEmbed(client, msg, 'paused', track);
            return msg.reply({ embeds: [embed] });
        } catch(err) {
            return console.error(err)
        }
    }
};