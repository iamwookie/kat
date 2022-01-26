const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const progressbar = require('string-progressbar');
const { MusicEmbed } = require('@utils/other/embeds');

module.exports = {
    name: 'queue',
    group: 'Music',
    description: 'View the queue.',
    cooldown: 5,
    guildOnly: true,

    // SLASH
    data() {
        let data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);
        return data;
    },

    async run(client, msg) {
        let subscription = client.subscriptions.get(msg.guildId);
        let empty = new MusicEmbed(client, msg).setTitle('The queue is empty!');

        if (!subscription) return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [empty] }) : msg.reply({ embeds: [empty] }).catch(() => msg.channel.send({ embeds: [empty] }));

        if (subscription.queue.length || subscription.playing) {
            let res = ''

            if (subscription.playing) {
                let track = subscription.playing
                let playbackDuration = Math.round((subscription.player.state.playbackDuration) / 1000)
                res += `Now Playing: **${track.title} [${track.duration}]**\n`
                res += `${progressbar.splitBar(track.durationRaw, playbackDuration, 30)[0]}\n\n`
            }
            
            if (subscription.queue.length) {
                let c = 1
                for (const track of subscription.queue) {
                    if (c == 16) {
                        res += `**+ ${subscription.queue.length - c + 1} more.**`
                        break;
                    } else {
                        res += `**${c})** \`${track.title} [${track.duration}]\`\n`
                    }

                    c++
                }
            }

            let queue = new MusicEmbed(client, msg, 'queue');
            queue.setDescription(res);
            return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [queue] }) : msg.reply({ embeds: [queue] }).catch(() => msg.channel.send({ embeds: [queue] }));
        } else {
            return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [empty] }) : msg.reply({ embeds: [empty] }).catch(() => msg.channel.send({ embeds: [empty] }));
        }
    }
};