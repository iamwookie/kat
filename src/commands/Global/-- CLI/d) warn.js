const warn = require('@scripts/slash-warning');

module.exports = {
    name: 'warn',
    group: 'CLI',
    
    async run(client) {
        warn();
    }
};