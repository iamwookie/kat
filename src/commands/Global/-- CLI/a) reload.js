const reload = require('@scripts/reload-commander');

module.exports = {
    name: 'reload',
    group: 'CLI',
    async run(client) {
        if (!client.commander) return console.log('❌ Commander not found.\n');
        
        await reload();
    }
};