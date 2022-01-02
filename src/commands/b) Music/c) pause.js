module.exports = {
    name: 'pause',
    description: 'Pause the track.',
    group: 'Music',
    async run(client, msg, args) {
        let subscription = client.subscriptions.get(msg.guildId)

        if (!subscription) {
            return msg.channel.send("I'm not playing anything!")
        }

        try {
            subscription.pause()
            return msg.channel.send("Paused the audio.")
        } catch(err) {
            return console.error(err)
        }
    }
};