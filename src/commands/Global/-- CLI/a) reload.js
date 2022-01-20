const reloadCommands = require('@scripts/reload-commands');
const reloadCommander = require('@scripts/reload-commander');

module.exports = {
    name: 'reload',
    group: 'CLI',
    async run(client, args) {
        if (!client.commander) return console.log('❌ Commander Not Found.\n'.yellow);
        
        if (!args) {
            reloadCommands();
        } else if (args == 'full') {
            await reloadCommander();
        } else {
            console.log('❌ Invalid Args'.yellow);
        }
    }
};