const { SlashCommandBuilder } = require('@discordjs/builders');
const { MusicEmbed } = require('@utils/other/embeds');

module.exports = {
  name: 'queue',
  group: 'Music',
  description: 'View the queue.',
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

    let empty = new MusicEmbed(client, int).setTitle('The queue is empty!');

    if (!subscription || !subscription.active() && !subscription.queue.length) return int.editReply({ embeds: [empty] });

    let res = '';

    if (subscription.active()) {
      let track = subscription.active();
      res += `Now Playing: **${track.title} [${track.duration}]**\n`;
      res += `${subscription.queue.createProgressBar({ length: 30 })}\n`;
    }

    if (subscription.queue.tracks.length) {
      let c = 1;
      for (const track of subscription.queue.tracks) {
        if (c == 16) {
          res += `**+ ${subscription.queue.tracks.length - c + 1} more.**`;
          break;
        } else {
          res += `**${c})** \`${track.title} [${track.duration}]\`\n`;
        }
        c++;
      }
    }

    let queue = new MusicEmbed(client, int, 'queue');
    queue.setDescription(res);
    return int.editReply({ embeds: [queue] });
  }
};