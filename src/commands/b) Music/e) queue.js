module.exports = {
    name: 'queue',
    description: 'View the queue.',
    group: 'Music',
    async run(client, msg, args) {
        let subscription = client.subscriptions.get(msg.guildId)

        if (!subscription) return msg.channel.send("There is no queue!")

        let queue = subscription.queueString()

        if (queue) {
            let res = ''
            if (subscription.playing) res += `Now Playing: **${subscription.playing.title} [${subscription.playing.duration}]**\n\n`
            res += queue
            return msg.channel.send(res)
        } else {
            return msg.channel.send("The queue is empty!")
        }
    }
};