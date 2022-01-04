module.exports = {
    name: 'skip',
    description: 'Skip the track.',
    group: 'Music',
    cooldown: 5,
    async run(client, msg, args) {
        let subscription = client.subscriptions.get(msg.guildId)

        if (!subscription || subscription.isPlayerPaused()) return msg.reply('I\'m not playing anything!')

        if (subscription.queue.length == 0) return msg.reply('Nothing to skip to! This is the last song!.')

        try {
            subscription.player.stop()
            return msg.reply('Skipped the current song.')
        } catch(err) {
            return console.error(err)
        }
    }
};