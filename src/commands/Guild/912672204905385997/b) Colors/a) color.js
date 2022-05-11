const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const ColorManager = require('@core/color/manager');
const { failEmbed } = require('@utils/other/embeds');

module.exports = {
    name: 'color',
    group: 'Color',
    description: 'Choose a color role.',
    guildOnly: true,

    // AUTHORIZATION
    guilds: ['912672204905385997'],

    // SLASH
    data() {
        return (
            new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
        )
    },
    
    async run(client, int) {
        let manager = client.colors.get(int.guildId);

        if (!manager) manager = await ColorManager.initialize(client, int.guild);

        let embed = manager.createEmbed(int);
        let menu = await manager.createMenu(int);

        return int.editReply({ embeds: [embed], components: [menu] });
    }
};