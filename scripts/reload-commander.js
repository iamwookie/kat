const client = require('../index');
const Commander = require('../commander');

module.exports = async () => {
    delete require.cache[require.resolve('../commander')];
    await Commander.reload(client);
    console.log('📜 ' + '>> Commander Successfully Reloaded.'.brightGreen.bold + ' ✅');
}