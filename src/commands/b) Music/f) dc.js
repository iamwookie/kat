module.exports = {
    name: 'dc',
    description: 'Disconnect the bot.',
    group: 'Music',
    cooldown: 5,
    async run(client, msg, args) {
        let subscription = client.subscriptions.get(msg.guildId)

        if (!subscription || subscription.isVoiceDestroyed()) return msg.reply('I\'m not connected!')

        subscription.voice.destroy();
        return msg.reply('Disconnected the bot!')
    }
};