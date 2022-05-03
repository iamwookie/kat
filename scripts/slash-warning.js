const Discord = require('discord.js');
const client = require('../index');

module.exports = async () => {
    let embed = new Discord.MessageEmbed()
    .setColor('YELLOW')
    .setTitle('Attention!')
    .setDescription('**This message is to inform you that support for text commands has ended.** This bot will no longer be able to respond to text commands. Instead use the updated slash commands which will show up when you type \`/\`.\n\nThis has done to ensure that the bot is up to date with Discord Guidelines. As in the future, text commands will not be supported globally throughout Discord. You can get more information regarding slash commands [here](https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ).\n\nThank you!')
    .setFooter({ text: 'NOTE: You have been sent this message as you are a server owner.' })

    let sent = [];

    for (const [_, guild] of client.guilds.cache) {
        try {
            let owner = await guild.fetchOwner();
            if (!sent.includes(owner.user.id)) await owner.send({ embeds: [embed] });
            sent.push(owner.user.id);
            console.log(`Successfully sent message to guild owner for: ${guild.name} (${guild.id})`.brightGreen);
        } catch (err) {
            console.log(`Error sending message to guild owner for: ${guild.name} (${guild.id})`.red);
            console.log(err);
        }
    }
}