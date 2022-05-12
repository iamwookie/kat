const reloadCommands = require('@scripts/reload-commands');
const registerSlash = require('@scripts/register-slash');

module.exports = {
    name: 'reload',
    group: 'CLI',
    
    run(client, args) {
        if (!client.commander) return console.log('❌ Commander Not Found.\n'.yellow);
        
        if (args == 'commands') return reloadCommands();
        if (args == 'slash') return registerSlash();
        
        if (args == 'colors') {
            if (client.colors) client.colors.clear();
            return console.log('✅ Colors Reloaded.'.green);
        }

        console.log('❌ Invalid Arguments.'.yellow);
    }
};