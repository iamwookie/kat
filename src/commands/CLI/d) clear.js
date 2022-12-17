const clearSlash = require('@scripts/clear-slash');

module.exports = {
  name: 'clear',
  group: 'CLI',

  async run(client, args) {
    if (!args) return console.log('❌ No ID Provided.'.yellow);
    clearSlash(args);
  }
};