require('dotenv').config()
require('module-alias/register');
// ------------------------------------
const loadCommander = require('./commander');
// ------------------------------------
const { Client, Intents } = require('discord.js');
const { bot } = require('./config.json');
const startTime = Date.now();
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

console.log('>>> Loading...\n');

client.on('ready', async () => {
    // ------------------------------------
    loadCommander(client);
    // ------------------------------------
    console.log(`\n>>> App Online, Client: ${client.user.tag} (${client.user.id}) [Guilds: ${client.guilds.cache.size}]`);
    console.log(`>>> App Loaded In: ${(Date.now() - startTime)}ms\n`);
});

client.login(process.env.BOT_TOKEN);