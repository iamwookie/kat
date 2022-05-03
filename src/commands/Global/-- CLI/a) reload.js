const reloadCommands = require('@scripts/reload-commands');
const registerSlash = require('@scripts/register-slash');

module.exports = {
    name: 'reload',
    group: 'CLI',
    async run(client, args) {
        if (!client.commander) return console.log('❌ Commander Not Found.\n'.yellow);
        
        if (args == 'commands') {
            reloadCommands();
        } else if (args == 'slash') {
            await registerSlash();
        } else {
            console.log('❌ Invalid Args'.yellow);
        }
    }
};