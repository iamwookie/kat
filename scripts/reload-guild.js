const client = require('../index');

module.exports = () => {
  if (client.commander) client.commander.registerGuildCommands();
  console.log('📜 ' + '>> Commander Guild Commands Reloaded.'.brightGreen.bold + ' ✅');
};