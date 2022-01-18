const { MusicEmbed } = require('@utils/embeds');

module.exports = {
    name: 'skip',
    group: 'Music',
    description: 'Skip the track.',
    cooldown: 5,
    guildOnly: true,
    async run(client, msg, args) {
        let subscription = client.subscriptions.get(msg.guildId);
        if (!subscription || !subscription.isPlayerPlaying()) {
            let embed = new MusicEmbed(client, msg).setTitle('I\'m not playing anything!');
            return msg.reply({ embeds: [embed] });
        } 

        if (subscription.queue.length == 0) {
            let embed = new MusicEmbed(client, msg).setTitle('Nothing to skip to! This is the last song!');
            return msg.reply({ embeds: [embed] });
        }

        try {
            let track = subscription.playing;
            subscription.player.stop();

            let embed = new MusicEmbed(client, msg, 'skipped', track);
            return msg.reply({ embeds: [embed] });
        } catch(err) {
            console.log('MUSIC (COMMAND) >> SKIP ERROR')
			console.error(err);
            let embed = new MusicEmbed(client, msg).setTitle('An error occured! Contact a developer ASAP!');
            return msg.reply({ embeds: [embed] });
        }
    }
};