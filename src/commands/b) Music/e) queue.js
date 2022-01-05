module.exports = {
    name: 'queue',
    description: 'View the queue.',
    group: 'Music',
    guildOnly: true,
    cooldown: 5,
    async run(client, msg, args) {
        let subscription = client.subscriptions.get(msg.guildId)

        let filler = ''
        if (!subscription) return msg.reply('The queue is empty!')

        if (subscription.isVoiceDestroyed()) {
            filler = 'Next Up'
        } else {
            filler = 'Now Playing'
        }

        if (subscription.queue.length || subscription.playing) {
            let res = ''

            if (subscription.playing) res += `${filler}: **${subscription.playing.title} [${subscription.playing.duration}]**\n\n`
            
            if (subscription.queue.length) {
                res += 'Queue: \n'
                let c = 1
                for (const track of subscription.queue) {
                    res += `\`${c}) ${track.title} [${track.duration}]\`\n`
                    c++
                }
            }
            
            return msg.reply(res)
        } else {
            return msg.reply('The queue is empty!')
        }
    }
};