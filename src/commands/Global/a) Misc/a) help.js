const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    aliases: ['info'],
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

        console.log('ran');

        for (const [key, group] of client.commander.groups) {
            if (key == 'CLI') continue;

            let reply = '';

            for (const [_, command] of group) {
                if (command.hidden || command.disabled || (command.guilds && (!int.guild || !command.guilds.includes(int.guild.id)) || (command.users && !command.users.includes(int.user.id)))) continue;

                let aliasmsg = '';

                if (command.aliases) {
                    for (const alias of command.aliases) {
                        aliasmsg += `, ${client.prefix}${alias}`;
                    }

                    reply += `\`\`${client.prefix}${command.name}${aliasmsg}${command.format ? ` ${command.format.replace('[prefix]', client.prefix).replace('[aliases]', aliasmsg)}` : ''}\`\` → ${command.description}\n`;
                } else {
                    reply += `\`\`${client.prefix}${command.name}${command.format ? ` ${command.format.replace('[prefix]', client.prefix).replace('[aliases]', aliasmsg)}` : ''}\`\` → ${command.description}\n`;
                }
            }

            if (reply) replyEmbed.addFields([{ name: `${key} Commands`, value: reply }]);
        }

        int.editReply({ embeds: [replyEmbed] });
    }
};