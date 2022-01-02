module.exports = {
    name: 'skip',
    description: 'Skip the track.',
    group: 'Music',
    async run(client, msg, args) {
        let subscription = client.subscriptions.get(msg.guildId)

        if (!subscription) return msg.channel.send('I\'m not playing anything!')

        if (subscription.queue.length == 0) return msg.channel.send('Nothing to skip to! Use `!stop` to stop the song.')

        try {
            subscription.player.stop()
            return msg.channel.send('Skipped the song.')
        } catch(err) {
            return console.error(err)
        }
    }
};