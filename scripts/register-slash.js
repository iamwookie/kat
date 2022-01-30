const client = require('../index');

module.exports = async () => {
    if (client.slash) await client.slash.updateCommands();
    console.log('📜 ' + '>> SlashCommander Commands Registered.'.brightGreen.bold + ' ✅');
}