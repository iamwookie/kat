const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'help',
  group: 'Misc',
  description: 'Stop it. Get some help.',

  // SLASH
  data() {
    return (
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
    );
  },

  async run(client, int) {
    let replyEmbed = new Discord.MessageEmbed()
      .setColor('RANDOM')
      .setTitle('**Help Menu**')
      .setAuthor({ name: int.user.tag, iconURL: int.user.avatarURL({ dynamic: true }) })
      .setFooter({ text: 'Parameters with a \'?\' at the start are optional.' });

    client.commander.groups.forEach((group, key) => {
      if (key == 'CLI') return;

      let reply = '';
      group.forEach(async x => {
        if (x.hidden || x.disabled || (x.guilds && (!int.guild || !x.guilds.includes(int.guild.id)) || (x.users && !x.users.includes(int.user.id)))) return;

        if (x.aliases) {
          var aliasmsg = "";
          for (const alias of x.aliases) {
            aliasmsg += `, ${client.prefix}${alias}`;
          }

          reply += `\`\`${client.prefix}${x.name}${aliasmsg}${x.format ? ` ${x.format.replace('[prefix]', client.prefix).replace('[aliases]', aliasmsg)}` : ''}\`\` → ${x.description}\n`;
        } else {
          reply += `\`\`${client.prefix}${x.name}${x.format ? ` ${x.format.replace('[prefix]', client.prefix).replace('[aliases]', aliasmsg)}` : ''}\`\` → ${x.description}\n`;
        }
      });
      if (reply) replyEmbed.addField(key + ' Commands', reply);
    });

    int.editReply({ embeds: [replyEmbed] });
  }
};