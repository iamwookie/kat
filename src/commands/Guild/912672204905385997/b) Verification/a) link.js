const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const NebulaLinkSession = require('@core/verification/linksession');
const { failEmbed } = require('@utils/other/embeds');

module.exports = {
    name: 'link',
    group: 'Verification',
    description: 'Link your account with the Nebula Services.',
    guildOnly: true,

    // AUTHORIZATION
    guilds: ['912672204905385997', '858675408140369920'],

    // SLASH
    data() {
        let data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);
        return data;
    },
    
    async run(client, msg) {
        let author = msg instanceof Discord.CommandInteraction ? msg.user : msg.author;
        let user = await client.redis.hGet('nebula-link', author.id);

        if (user) {
            let exists = failEmbed('You have already linked your account with Nebula Services!', msg.author);
            return msg instanceof Discord.CommandInteraction ? msg.editReply({ embeds: [exists] }) : msg.reply({ embeds: [exists] }).catch(() => msg.channel.send({ embeds: [exists] }));
        }

        if (NebulaLinkSession.cache.has(author.id)) {
            let started = failEmbed('You have already started a link session!', msg.author);
            return msg instanceof Discord.CommandInteraction ? msg.editReply({ embeds: [started] }) : msg.reply({ embeds: [started] }).catch(() => msg.channel.send({ embeds: [started] }));
        }

        return NebulaLinkSession.initialize(client, msg);
    }
};