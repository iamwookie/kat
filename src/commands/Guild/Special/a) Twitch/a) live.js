const Discord = require('discord.js');
const Commander = require('@commander');
const { SlashCommandBuilder } = require('@discordjs/builders');
const TwitchManager = require('@core/twitch/twitchmanager');
const { successEmbed, failEmbed, loadEmbed } = require('@utils/other/embeds');
const { ChannelType } = require('discord-api-types/v9');
// -----------------------------------

module.exports = {
  name: 'live',
  group: 'Twitch',
  description: 'Send live stream announcement.',

  // AUTHORIZATION
  guilds: [],
  users: [],

  // SLASH
  data() {
    return (
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addSubcommand(sub => {
          return sub.setName('send')
            .setDescription('Send the livestream message.');
        })
        .addSubcommand(sub => {
          return sub.setName('setup')
            .setDescription('Setup twitch.')
            .addStringOption(option => {
              return option.setName('username')
                .setDescription('Your twitch channel name without the URL. (e.g `ninja`)')
                .setRequired(true);
            })
            .addChannelOption(option => {
              return option.setName('channel')
                .setDescription('The channel to announce in.')
                .addChannelType(ChannelType.GuildText)
                .setRequired(true);
            });
        })
    );
  },

  async run(client, int) {
    TwitchManager.initialize(client);

    let command = int.options.getSubcommand();

    if (command == 'setup') {
      let username = int.options.getString('username');
      let channel = await client.twitch.getUserByUserName(username);

      if (!channel) {
        let notFound = failEmbed('Invalid channel name provided!', int.user);
        return int.editReply({ embeds: [notFound] });
      }

      let announce = int.options.getChannel('channel');

      if (!announce) {
        let notFound = failEmbed('Invalid channel ID(s) provided!', int.user);
        return int.editReply({ embeds: [notFound] });
      }

      await client.database.set(int.guildId, 'twitch', { 'user': username, 'channels': [announce.id] });

      let success = successEmbed('Setup complete!', int.user);
      success.setTitle('Twitch Setup');
      success.addFields(
        { name: 'User', value: `[${username}](https://twitch.tv/${username})` },
        { name: 'Channel', value: `\`#${announce.name}\`` }
      );

      return int.editReply({ embeds: [success] });
    }

    if (command == 'send') {
      let wait = loadEmbed('Searching...', int.user);
      await int.editReply({ embeds: [wait] });

      let info = await client.database.get(int.guildId, 'twitch');

      if (!info) {
        let notFound = failEmbed('You have not completed the setup. Try running the command: `/live setup`', int.user);
        return int.editReply({ embeds: [notFound] });
      }

      let stream = await client.twitch.getStreamByUserName(info.user);

      if (!stream) {
        let fail = failEmbed('User is not streaming!', int.user);
        return int.editReply({ embeds: [fail] });
      }

      let user = await stream.getUser();
      let imageURL = await stream.getThumbnailUrl(1280, 720);

      let embed = new Discord.MessageEmbed()
        .setColor('#9146ff')
        .setAuthor({ name: `${stream.userDisplayName} is NOW LIVE!!`, iconURL: user.profilePictureUrl, URL: `https://www.twitch.tv/${user.name}` })
        .setTitle(stream.title)
        .setURL(`https://www.twitch.tv/${user.name}`)
        .addFields(
          { name: 'Playing', value: stream.gameName, inline: true },
          { name: 'Viewers', value: stream.viewers.toString(), inline: true },
          { name: '-----------------------------------------------------------', value: `[Click here to watch now!](https://www.twitch.tv/${user.name})` }
        )
        .setImage(imageURL);

      for (const channelId of info.channels) {
        try {
          let channel = await int.guild.channels.fetch(channelId);
          if (channel) channel.send({ content: "@everyone", embeds: [embed] });
        } catch (err) {
          Commander.handleError(client, err, false);
          console.error(`Guild Commands (ERROR) (${this.guilds[0]}) >> live: Failed To Fetch Channel`.red);
          console.error(err);

          let fail = failEmbed('Failed to send message(s)! Are you sure I have enough permissions? Try running the setup again if this message keeps appearing.', int.user);
          return int.editReply({ embeds: [fail] });
        }
      }

      let success = successEmbed('Message(s) sent!', int.user);
      return int.editReply({ embeds: [success] });
    }
  }
};