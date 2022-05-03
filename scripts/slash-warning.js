const Discord = require('discord.js');
const client = require('../index');

module.exports = async () => { 
    let sent = [];

    for (const [_, guild] of client.guilds.cache) {
        try {
            let owner = await guild.fetchOwner();
            if (!sent.includes(owner.user.id)) await owner.send('has been done*');
            sent.push(owner.user.id);
            console.log(`Successfully sent message to guild owner for: ${guild.name} (${guild.id})`.brightGreen);
        } catch (err) {
            console.log(`Error sending message to guild owner for: ${guild.name} (${guild.id})`.red);
            console.log(err);
        }
    }
}