const activeCheck = require('@scripts/active-check');

module.exports = {
    name: 'active',
    group: 'CLI',
    async run(client) {
        if (!client.subscriptions) console.log('❌ Subscriptions Not Found.\n'.yellow);
        activeCheck();
    }
};