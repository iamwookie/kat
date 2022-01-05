module.exports = {
    name: 'pause',
    description: 'Pause the track.',
    group: 'Music',
    guildOnly: true,
    cooldown: 5,
    async run(client, msg, args) {
        let subscription = client.subscriptions.get(msg.guildId)
        if (!subscription) {
            return msg.reply('I\'m not playing anything!')
        }

        try {
            subscription.pause()
            return msg.reply('Paused the audio.')
        } catch(err) {
            return console.error(err)
        }
    }
};