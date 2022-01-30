const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { failEmbed } = require('@utils/other/embeds');

/*
const io = require('@pm2/io');
const usageCount = io.counter({
    name: 'PPs Measured',
    id: 'usage/commands/pp'
});
*/

// Simple command for PP size, this is hidden just a fun command, IGNORE THIS initially.
module.exports = {
    name: 'pp',
    group: 'Misc',
    description: 'How big is it?',
    format: '/ [prefix]pp <@mention>',
    guildOnly: true,

    // SLASH
    data() {
        let data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addMentionableOption(option => {
            option.setName('user');
            option.setDescription('The user to analyze.');
            return option;
        });
        return data;
    },
    

    async run(client, msg, args) {
        // usageCount.inc();
        // ------------
        let author = msg instanceof Discord.CommandInteraction? msg.user : msg.author;
        let size = 20
        let body = '='
        let reply = new Discord.MessageEmbed()
        .setTitle(`${author.username}\'s PP Size`)
        .setDescription(`8${body.repeat(Math.floor(Math.random() * (size - 1)))}D`)
        .setColor('RANDOM')
        .setAuthor({ name: author.tag, iconURL: author.avatarURL({dynamic: true}) });

        let gif = 'https://tenor.com/view/the-biggest-one-cillian-murphy-bustle-huge-massive-gif-21987675'

        if (msg instanceof Discord.CommandInteraction? msg.options.getMentionable('user') : args) {
            let mention = msg instanceof Discord.CommandInteraction? msg.options.getMentionable('user') : msg.mentions.members.first();
            if(mention instanceof Discord.GuildMember) {
                reply.setTitle(`${mention.user.username}\'s PP Size`);
                if (mention.user.id == client.user.id) {
                    let res = ':no_entry: ERROR: The measurement values are too large to send.'
                    return msg instanceof Discord.CommandInteraction? msg.editReply(res) : msg.reply(res).catch(() => msg.channel.send(res));
                }
                if (mention.user.id == '130065975956471808') {
                    return msg instanceof Discord.CommandInteraction? msg.editReply(gif) : msg.reply(gif).catch(() => msg.channel.send(gif));
                }
                if (mention.user.id == '438438026566172682') {
                    reply.setDescription(`8${body.repeat(Math.floor(Math.random() * 5))}D`);
                }
            } else {
                let noMention = failEmbed('You have not mentioned a valid user!', author);
                return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [noMention] }) : msg.reply({ embeds: [noMention] }).catch(() => msg.channel.send({ embeds: [noMention] }));
            }
        } else {
            if (author.id == '130065975956471808') {
                return msg instanceof Discord.CommandInteraction? msg.editReply(gif) : msg.reply(gif).catch(() => msg.channel.send(gif));
            }
            if (author.id == '438438026566172682') {
                reply.setDescription(`8${body.repeat(Math.floor(Math.random() * 5))}D`);
            }
        }

        msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [reply] }) : msg.reply({ embeds: [reply] }).catch(() => msg.channel.send({ embeds: [reply] }));
    }
};