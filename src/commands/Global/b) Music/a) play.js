const Discord = require('discord.js');
const Commander = require('@commander/commander');
const { SlashCommandBuilder } = require('@discordjs/builders');
const MusicSubscription = require('@core/music/subscription');
const { MusicEmbed } = require('@utils/other/embeds');

module.exports = {
    name: 'play',
    group: 'Music',
    description: 'Search for a track and play it or add it to the queue.',
    format: '<?search/url>',
    cooldown: 5,
    guildOnly: true,

    // SLASH
    data() {
        return (
            new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option => {
                option.setName('query');
                option.setDescription('The name or URL of the song.');
                return option;
            })
        )
    },

    async run(client, int) {
        let channel = int.member.voice.channel;

        if (!channel) {
            let nochannel = new MusicEmbed(client, int).setTitle('You are not in a channel!');
            return int.editReply({ embeds: [nochannel] });
        }

        let subscription = client.subscriptions.get(int.guildId);

        args = int.options.getString('query');

        if (subscription && subscription.isPaused()) {
            subscription.unpause();
            let resumed = new MusicEmbed(client, int, 'resumed', subscription.active());
            if (!args) return int.editReply({ embeds: [resumed] });
            int.channel.send({ embeds: [resumed] });
        }

        if (!args) {
            let noargs = new MusicEmbed(client, int).setTitle('What should I play?');
            return int.editReply({ embeds: [noargs] });
        }

        if (!channel.joinable || !channel.speakable) {
            let noperms = new MusicEmbed(client, int).setTitle('I can\'t play in that voice channel!');
            return int.editReply({ embeds: [noperms] });
        }

        if (!subscription) subscription = await MusicSubscription.create(client, channel, int);

        if (!subscription.queue.connection) await subscription.connect();

        try {
            let searching = new MusicEmbed(client, int, 'searching');
            reply = await int.editReply({ embeds: [searching] });

            let search = await client.player.search(args, { requestedBy: int.user });

            if (search.playlist) {
                try {
                    subscription.queue.addTracks(search.tracks);
                    console.log(`Music >> Queue Added ${search.tracks.length} Tracks`.green);
                } catch (err) {
                    console.error('Music (ERROR) >> Queue Error Adding Tracks'.red);
                    console.error(err);

                    let failedAdd = new MusicEmbed(client, int).setTitle('I couldn\'t add that playlist!');
                    return int.editReply({ embeds: [failedAdd] });
                }
            } else {
                try {
                    track = search.tracks[0]
                    subscription.queue.addTrack(track);
                    console.log(`Music >> Queue Added Track`.green);
                } catch (err) {
                    console.error('Music (ERROR) >> Queue Error Adding Track'.red);
                    console.error(err);

                    let failedAdd = new MusicEmbed(client, int).setTitle('I couldn\'t add that track!');
                    return int.editReply({ embeds: [failedAdd] });
                }
            }

            if (!subscription.isPlaying()) {
                subscription.queue.play();
            }

            let enqueued = new MusicEmbed(client, int, 'enqueued', track);
            return reply.edit({ embeds: [enqueued] });
		} catch (err) {
            Commander.handleError(client, err, false, int.guild);
            console.error('Music Commands (ERROR) >> play: Error Running Command'.red);
			console.error(err);
            
            let fail = new MusicEmbed(client, int).setTitle('An error occured! A developer has been notified!');
            return int.editReply({ embeds: [fail] });
        }
    }
};