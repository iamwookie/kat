const client = require('../index');

module.exports = async () => {
  if (client.commander) {
    await client.commander.updateGlobalCommands();
    await client.commander.updateGuildCommands();
  }
  
  console.log('📜 ' + '>> Commander Commands Registered.'.brightGreen.bold + ' ✅');
};