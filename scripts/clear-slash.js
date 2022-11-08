const client = require('../index');
const Discord = require('discord.js');

module.exports = async (id) => {
  let guild = client.guilds.cache.get(id);

  if (!guild) return console.log('❌ Guild Not Found.'.yellow);

  try {
    await client.commander.rest.put(Discord.Routes.applicationGuildCommands(process.env.CLIENT_ID, guild.id), { body: [] });
    console.log(`✅ Successfully Cleared Commands For: ${guild.name} (${guild.id})`.green);
  } catch (err) {
    console.log(`❌ Failed To Clear Commands For: ${guild.name} (${guild.id})`.brightGreen.bold);
    console.log(err);
  }
};