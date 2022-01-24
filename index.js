require('dotenv').config()
require('module-alias/register');
require('colors');
// ------------------------------------
const { Client, Intents } = require('discord.js');
// ------------------------------------
const Commander = require('./commander');
const { bot } = require('./config.json');
const redis = require('./redis');
const now = Date.now();
const CommanderDatabase = require('./database');
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
        activities: [
            {
                name: 'cat music.',
                type: 'LISTENING'
            }
        ]
    }
});
client.prefix = bot.prefix,
client.owner = '244662779745665026'

console.log('>>> Loading...\n'.magenta.bold.underline);

client.once('ready', async (client) => {
    // ------------------------------------
    client.redis = await redis();
    client.database = await CommanderDatabase.initialize(client);
    client.commander = await Commander.initialize(client);
    // ------------------------------------
    console.log(`\n>>> App Online, Client: ${client.user.tag} (${client.user.id}) [Guilds: ${client.guilds.cache.size}]`.magenta.bold.underline);
    console.log(`>>> App Loaded In: ${(Date.now() - now)}ms\n`.magenta.bold.underline);
});

client.on('error', function TestError(err) {
    Commander.handleError(client, err);
})

client.login(process.env.BOT_TOKEN);

module.exports = client;