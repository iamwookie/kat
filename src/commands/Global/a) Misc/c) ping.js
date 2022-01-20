const Discord = require('discord.js');

// Simple ping command, only for devs.
module.exports = {
    name: 'ping',
    group: 'Misc',
    description: 'Check ping statistics.',
    hidden: true,
    cooldown: 5,
    // AUTHORIZATION
    users: ['244662779745665026'],
    run(client, msg) {
        if (msg.author.id == "130065975956471808" || msg.author.id == "244662779745665026") {
            let embed = new Discord.MessageEmbed()
            .setColor('#FF0030')
            .setTitle('Latency Stats (Developer)')
            .addFields(
                { name: 'Bot Ping', value: `\`\`${Math.abs(msg.createdTimestamp - Date.now())}ms\`\``, inline: true },
                { name: 'WS Ping', value: `\`\`${Math.abs(client.ws.ping)}ms\`\``, inline: true }
            )
            .setAuthor({ name: msg.author.tag, iconURL: msg.author.avatarURL({dynamic: true}) });
        
            msg.reply({ embeds: [embed] }).catch(() => msg.channel.send({ embeds: [embed] }));
        } else {
            return;
        }
    }
};