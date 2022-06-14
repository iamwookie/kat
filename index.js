require('module-alias/register');
require('colors');
// ------------------------------------
const { Client, Intents } = require('discord.js');
// ------------------------------------
const Commander = require('./commander/commander');
const CommanderDatabase = require('./commander/database');
// ------------------------------------
const { bot } = require('./config.json');
const now = Date.now();
// ------------------------------------
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_PRESENCES
  ],
  partials: [
    'CHANNEL' // Partials are used to read DM messages.
  ],
  presence: {
    status: 'online',
    activities: [
      {
        name: '/help',
        type: 'LISTENING'
      }
    ]
  }
});
client.prefix = bot.prefix,
  client.dev = '244662779745665026';

console.log('>>> Loading...\n'.magenta.bold.underline);

client.once('ready', async (client) => {
  // ------------------------------------
  client.database = await CommanderDatabase.initialize(client);
  client.commander = Commander.initialize(client);
  // ------------------------------------
  console.log(`\n>>> App Online, Client: ${client.user.tag} (${client.user.id}) [Guilds: ${client.guilds.cache.size}]`.magenta.bold.underline);
  console.log(`>>> App Loaded In: ${(Date.now() - now)}ms\n`.magenta.bold.underline);
});

client.on('error', (err) => {
  Commander.handleError(client, err, false);
});

client.login(process.env.BOT_TOKEN);

module.exports = client;