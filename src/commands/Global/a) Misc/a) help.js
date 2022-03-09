const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'help',
    group: 'Misc',
    description: 'Stop it. Get some help.',

    // SLASH
    data() {
        let data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);
        return data;
    },

    async run(client, msg) {
        let author = msg instanceof Discord.CommandInteraction ? msg.user : msg.author;
        let replyEmbed = new Discord.MessageEmbed()
        .setColor('RANDOM')
        .setTitle('**Help Menu**')
        .setAuthor({ name: author.tag, iconURL: author.avatarURL({ dynamic: true }) })
        .setFooter({ text: 'Parameters with a \'?\' at the start are optional.' });

        let prefix = client.prefix;

        if (msg instanceof Discord.CommandInteraction ? msg.inGuild() : msg.guild) prefix = await client.database.get(msg.guildId, 'prefix') || client.prefix;

        // We build the reply here.
        client.commander.groups.forEach((group, key) => {
            if (key == 'CLI') return;

            let reply = '';
            group.forEach(async x => {
                if (x.hidden || x.disabled || (x.guilds && (!msg.guild || !x.guilds.includes(msg.guild.id)) || (x.users && !x.users.includes(author.id)))) return;

                if (x.aliases) {
                    // If command has aliases, it builds reply like this for every command that has alias.
                    var aliasmsg = "";
                    x.aliases.forEach(alias => {
                        aliasmsg += `, ${prefix}${alias}`
                    })
                    reply += `\`\`${prefix}${x.name}${aliasmsg}${x.format ? ` ${x.format.replace('[prefix]', prefix).replace('[aliases]', aliasmsg)}` : ''}\`\` → ${x.description}\n`
                } else {
                    // // If command has no aliases, it builds reply like this for every command that has no aliases.
                    reply += `\`\`${prefix}${x.name}${x.format ? ` ${x.format.replace('[prefix]', prefix).replace('[aliases]', aliasmsg)}` : ''}\`\` → ${x.description}\n`
                }
            })
            if (reply) replyEmbed.addField(key + ' Commands', reply);
        });
        
        msg instanceof Discord.CommandInteraction ? msg.editReply({ embeds: [replyEmbed] }) : msg.reply({ embeds: [replyEmbed] }).catch(() => msg.channel.send({ embeds: [replyEmbed] }));
    }
};