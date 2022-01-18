const Discord = require('discord.js');
const { failEmbed } = require('@utils/embeds');

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
    async run(client, msg, args) {
        // usageCount.inc();
        // ------------
        let size = 20
        let body = '='
        let noMention = failEmbed('You have not mentioned a valid user!', msg.author);
        let reply = new Discord.MessageEmbed()
        .setTitle(`${msg.author.username}\'s PP Size`)
        .setDescription(`8${body.repeat(Math.floor(Math.random() * (size - 1)))}D`)
        .setColor('RANDOM')
        .setAuthor({ name: msg.author.tag, iconURL: msg.author.avatarURL({dynamic: true}) });

        if (args) {
            let mention = msg.mentions.members.first()
            if(mention) {
                reply.setTitle(`${mention.user.username}\'s PP Size`);
                if (mention.user.id == client.user.id) {
                    return msg.reply(':no_entry: ERROR: The measurement values are too large to send.');
                }
                if (mention.user.id == '130065975956471808') {
                    return msg.reply('https://tenor.com/view/the-biggest-one-cillian-murphy-bustle-huge-massive-gif-21987675');
                }
                if (mention.user.id == '438438026566172682') {
                    reply.setDescription(`8${body.repeat(Math.floor(Math.random() * 5))}D`);
                }
            } else {
                return msg.reply({embeds: [noMention]});
            }
        } else {
            if (msg.author.id == '130065975956471808') {
                return msg.reply('https://tenor.com/view/the-biggest-one-cillian-murphy-bustle-huge-massive-gif-21987675');
            }
            if (msg.author.id == '438438026566172682') {
                reply.setDescription(`8${body.repeat(Math.floor(Math.random() * 5))}D`);
            }
        }

        msg.reply({embeds: [reply]})
    }
};