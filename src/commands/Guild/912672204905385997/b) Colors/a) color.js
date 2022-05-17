const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const ColorManager = require('@core/color/manager');
const { failEmbed } = require('@utils/other/embeds');

module.exports = {
    name: 'color',
    group: 'Color',
    description: 'Set colors for yourself via roles.',
    guildOnly: true,

    // AUTHORIZATION
    guilds: ['912672204905385997'],

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
                .setDescription('Add a color.')
                .addStringOption(option => {
                    return option.setName('name')
                    .setDescription('The name of the color.')
                    .setRequired(true);
                })
                .addStringOption(option => {
                    return option.setName('hex')
                    .setDescription('The hex code of the color (e.g #00000).')
                    .setRequired(true);
                })
            })
        )
    },
    
    async run(client, int) {
        let manager = client.colors.get(int.guildId);
        if (!manager) manager = await ColorManager.initialize(client, int.guild);

        let command = int.options.getSubcommand();

        if (command == 'set') {
            let embed = manager.createEmbed(int);
            let menu = await manager.createMenu(int);
    
            if (!menu) {
                let noOptions = failEmbed('No color options available!', int.user);
                return int.editReply({ embeds: [noOptions] });
            }
    
            return int.editReply({ embeds: [embed], components: [menu] });
        }

        if (command == 'add') {
            let admin = await client.database.get(int.guild.id, 'colorAdmin');

            if (admin && !int.member.roles.cache.has(admin)) {
                let noPerms = failEmbed('You do not have permission to use this command!', int.user);
                return int.editReply({ embeds: [noPerms] });
            }

            let name = int.options.getString('name');
            let hex = int.options.getString('hex');
            let re = /^#[0-9A-F]{6}$/i;

            if (!re.test(hex)) {
                let invalid = failEmbed('Invalid hex code provided. Make sure to include the `#!`', int.user);
                return int.editReply({ embeds: [invalid] });
            }

            let color = await manager.addColor(int, name, hex);

            if (!color) {
                let invalid = failEmbed('Error creating color!', int.user);
                return int.editReply({ embeds: [invalid] });
            }

            let embed = new Discord.MessageEmbed()
            .setTitle('Colors')
            .setDescription('Successfully created color!')
            .setAuthor({ name: int.user.tag, iconURL: int.user.avatarURL({ dynamic: true }) })
            .setColor(color.hexColor)
            .addFields(
                { name: 'Name', value: `\`${color.name}\``, inline: true },
                { name: 'Hex Code', value: `\`${color.hexColor}\``, inline: true }
            );

            return int.editReply({ embeds: [embed] });
        }
    }
};