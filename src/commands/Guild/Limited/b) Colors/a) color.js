const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const ColorManager = require('@lib/color/manager');

const ActionEmbed = require('@utils/embeds/action');

module.exports = {
    name: 'color',
    group: 'Color',
    description: 'Set colors for yourself via roles.',
    ephemeral: true,

    // AUTHORIZATION
    guilds: [],

    // SLASH
    data() {
        return (
            new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
                .setDMPermission(false)
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

        const manager = client.colors.get(int.guildId);
        if (!manager) manager = await ColorManager.initialize(client, int.guild);

        const command = int.options.getSubcommand();

        if (command == 'set') {
            const [embed, row] = await manager.createMenu(int);
            if (!embed) return int.editReply({ embeds: [new ActionEmbed('fail', 'No color options available!', int.user)] });

            return int.editReply({ embeds: [embed], components: [row] });
        }

        if (command == 'add') {
            const admin = await client.database.get(int.guild.id, 'colorAdmin');
            if (int.user.id != client.dev && int.user.id != int.guild.owner && (admin ? !int.member.roles.cache.has(admin) : true)) return int.editReply({ embeds: [new ActionEmbed('fail', 'You do not have permission to use this command!', int.user)] });

            const role = int.options.getRole('role');
            if (manager.colors.includes(role.id)) return int.editReply({ embeds: [new ActionEmbed('fail', 'This role is already a color!', int.user)] });

            const colorRole = await manager.addColor(role);
            if (!colorRole) return int.editReply({ embeds: [new ActionEmbed('fail', 'Error creating color!', int.user)] });

            const embed = new EmbedBuilder()
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