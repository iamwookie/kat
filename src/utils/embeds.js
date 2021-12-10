const Discord = require('discord.js');

module.exports = {
    successEmbed(reply, author) {
        let embed = new Discord.MessageEmbed()
        if (author) embed.setAuthor(author.tag, author.avatarURL({dynamic: true}));
        embed.setColor('GREEN')
        embed.setDescription(`✅ \u200b ${reply}`);
        return embed;
    },

    failEmbed(reply, author) {
        let embed = new Discord.MessageEmbed()
        if (author) embed.setAuthor(author.tag, author.avatarURL({dynamic: true}));
        embed.setColor('RED')
        embed.setDescription(`🚫 \u200b ${reply}`);
        return embed;
    },
}