module.exports = {
    name: 'stop',
    description: 'Clear the queue and leave.',
    group: 'Music',
    cooldown: 5,
    async run(client, msg) {
        let subscription = client.subscriptions.get(msg.guildId)

        if (!subscription) {
            return msg.reply('I\'m not playing anything!');
        }

        try {
			subscription.destroy();
            return msg.reply('Stopped playing! Cya!');
		} catch (err) {
			return console.error(err);
		}
    }
};