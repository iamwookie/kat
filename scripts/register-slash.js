const client = require('../index');

module.exports = async () => {
    if (client.commander) await client.commander.updateCommands();
    console.log('📜 ' + '>> Commander Commands Registered.'.brightGreen.bold + ' ✅');
}