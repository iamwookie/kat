const client = require('../index');

module.exports = () => {
  if (client.commander) client.commander.registerGlobalCommands();
  console.log('📜 ' + '>> Commander Global Commands Reloaded.'.brightGreen.bold + ' ✅');
};