const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    group: 'Misc',
    description: 'Stop it. Get some help.',
    ephemeral: true,

    // SLASH
    data() {
        return (
            new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
        );
    },

    async run(client, int) {
        const replyEmbed = new EmbedBuilder()
            .setColor('Random')
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
            if (reply) replyEmbed.addFields([{ name: `${key} Commands`, value: reply }]);
        });

        int.editReply({ embeds: [replyEmbed] });
    }
};