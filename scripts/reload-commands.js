const client = require('../index');

module.exports = () => {
    if (client.commander) client.commander.registerCommands();
    console.log('Commander >> Commands Reloaded.'.brightGreen + ' ✅ -📜');
}