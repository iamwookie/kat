const client = require('../index');

module.exports = async (id) => {
  let guild = client.guilds.cache.get(id);

  if (!guild) return console.log('❌ Guild Not Found.'.yellow);

  let commands = await guild.commands.fetch();

  if (!commands.size) return console.log('❌ No Commands Found.'.yellow);

  for (const [_, command] of commands) {
    try {
      await command.delete();
      console.log(`✅ Deleted Command: ${command.name}`.brightGreen.bold);
    } catch (err) {
      console.log(`❌ Failed To Delete Command: ${command.name}`.brightGreen.bold);
      console.log(err);
    }
  }
};