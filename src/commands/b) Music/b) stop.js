const { MusicEmbed } = require('@utils/embeds');

module.exports = {
    name: 'stop',
    aliases: ['dc'],
    description: 'Clear the queue and leave.',
    group: 'Music',
    guildOnly: true,
    cooldown: 5,
    async run(client, msg) {
        let subscription = client.subscriptions.get(msg.guildId)
        if (!subscription || !subscription.isPlayerPlaying()) {
            let embed = new MusicEmbed(client, msg).setTitle('I\'m not playing anything!');
            return msg.reply({ embeds: [embed] });
        }

        try {
			subscription.destroy();
            let embed = new MusicEmbed(client, msg).setTitle('👋 \u200b Stopped playing! Cya!');
            return msg.reply({ embeds: [embed] });
		} catch (err) {
			console.log('MUSIC (COMMAND) >> STOP ERROR')
			console.error(err);
            let embed = new MusicEmbed(client, msg).setTitle('An error occured! Contact a developer ASAP!');
            return msg.reply({ embeds: [embed] });
		}
    }
};