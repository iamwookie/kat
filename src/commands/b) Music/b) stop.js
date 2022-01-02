module.exports = {
    name: 'stop',
    hidden: true,
    description: 'Clear the queue and leave.',
    group: 'Music',
    async run(client, msg) {
        let subscription = client.subscriptions.get(msg.guildId)

        if (!subscription) {
            return msg.channel.send("I'm not playing anything!");
        }

        try {
			subscription.voice.destroy()
            client.subscriptions.delete(msg.channel.guildId)
            msg.channel.send("Stopped playing! Cya!")
		} catch (error) {
			console.warn(error);
			return;
		}
    }
};