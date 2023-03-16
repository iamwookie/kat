const reloadGlobal = require('@scripts/reload-global');
const reloadGuild = require('@scripts/reload-guild');
const registerSlash = require('@scripts/register-slash');

module.exports = {
    name: 'reload',
    group: 'CLI',

    run(client, args) {
        if (!client.commander) return console.log('❌ Commander Not Found.\n'.yellow);

        if (args == 'global') return reloadGlobal();
        if (args == 'guild') return reloadGuild();
        if (args == 'slash') return registerSlash();

        if (args == 'colors') {
            if (client.colors) client.colors.clear();
            return console.log('✅ Colors Reloaded.'.green);
        }

        console.log('❌ Invalid Arguments.'.yellow);
    }
};