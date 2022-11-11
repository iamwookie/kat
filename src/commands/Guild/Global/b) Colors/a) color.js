const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const ColorManager = require('@core/color/manager');
const ActionEmbed = require('@utils/embeds/action');

module.exports = {
    name: 'color',
    group: 'Color',
    description: 'Set colors for yourself via roles.',
    guildOnly: true,

    // AUTHORIZATION
    guilds: [],

    // SLASH
    data() {
        return (
            new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
                .addSubcommand(sub => {
                    return sub.setName('set')
                        .setDescription('Set your color.');
                })
                .addSubcommand(sub => {
                    return sub.setName('add')
                        .setDescription('Add a color role.')
                        .addRoleOption(option => {
                            return option.setName('role')
                                .setDescription('The role to add.')
                                .setRequired(true);
                        });
                })
        );
    },

    async run(client, int) {
        if (!client.database) return int.editReply({ embeds: [new ActionEmbed('fail', 'Database not online!', int.user)] });

        let manager = client.colors.get(int.guildId);
        if (!manager) manager = await ColorManager.initialize(client, int.guild);

        let command = int.options.getSubcommand();

        if (command == 'set') {
            let [embed, row] = await manager.createMenu(int);

            if (!embed) return int.editReply({ embeds: [new ActionEmbed('fail', 'No color options available!', int.user)] });

            return int.editReply({ embeds: [embed], components: [row] });
        }

        if (command == 'add') {
            let admin = await client.database.get(int.guild.id, 'colorAdmin');

            if (admin && int.user.id !== client.dev && !int.member.roles.cache.has(admin)) return int.editReply({ embeds: [new ActionEmbed('fail', 'You do not have permission to use this command!', int.user)] });

            let role = int.options.getRole('role');

            let colorRole = await manager.addColor(role);

            if (!colorRole) return int.editReply({ embeds: [new ActionEmbed('fail', 'Error creating color!', int.user)] });

            let embed = new Discord.EmbedBuilder()
                .setTitle('Colors')
                .setDescription('Successfully added a color role!')
                .setAuthor({ name: int.user.tag, iconURL: int.user.avatarURL({ dynamic: true }) })
                .setColor(colorRole.hexColor)
                .addFields([
                    { name: 'Name', value: `\`${colorRole.name}\``, inline: true },
                    { name: 'Hex Code', value: `\`${colorRole.hexColor}\``, inline: true }
                ]);

            return int.editReply({ embeds: [embed] });
        }
    }
};