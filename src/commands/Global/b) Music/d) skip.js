const Discord = require('discord.js');
const Commander = require('@commander');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MusicEmbed } = require('@utils/other/embeds');

module.exports = {
  name: 'skip',
  group: 'Music',
  description: 'Skip the track.',
  cooldown: 5,
  guildOnly: true,

  // SLASH
  data() {
    return (
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
    );
  },

  async run(client, int) {
    let subscription = client.subscriptions.get(int.guildId);

    if (!subscription || !subscription.isPlayerPlaying()) {
      let notplaying = new MusicEmbed(client, int).setTitle('I\'m not playing anything!');
      return int.editReply({ embeds: [notplaying] });
    }

    if (subscription.queue.length == 0) {
      let noskip = new MusicEmbed(client, int).setTitle('Nothing to skip to! This is the last song!');
      return int.editReply({ embeds: [noskip] });
    }

    try {
      subscription.player.stop();
      let success = new MusicEmbed(client, int, 'skipped', subscription.active);
      return int.editReply({ embeds: [success] });
    } catch (err) {
      console.error('Music Commands (ERROR) >> skip: Error Skipping Track'.red);
      console.error(err);
      Commander.handleError(client, err, false);

      let fail = new MusicEmbed(client, int).setTitle('An error occured! A developer has been notified!');
      return int.editReply({ embeds: [fail] });
    }
  }
};