require('dotenv').config();
require('module-alias/register');
require('colors');
// ------------------------------------
const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
// ------------------------------------
const Commander = require('./commander');
const CommanderDatabase = require('./commander/database');
const TwitchManager = require('@core/twitch/twitchmanager');
const Server = require('./src/server');
// ------------------------------------
const { bot } = require('./config.json');
const now = Date.now();
// ------------------------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildPresences
    ],
    partials: [
        Partials.Channel // Partials are used to read DM messages.
    ],
    presence: {
        status: 'online',
        activities: [
            {
                name: '/help',
                type: ActivityType.Listening
            }
        ]
    }
});

client.prefix = bot.prefix;
client.dev = '244662779745665026';

console.log('>>> Loading...\n'.magenta.bold.underline);

client.once('ready', async (client) => {
    // ------------------------------------
    client.database = await CommanderDatabase.initialize(client);
    client.commander = await Commander.initialize(client);
    client.twitch = await TwitchManager.initialize(client);
    client.server = await Server(client).catch(console.error);
    // ------------------------------------
    console.log(`\n>>> App Online, Client: ${client.user.tag} (${client.user.id}) [Guilds: ${client.guilds.cache.size}]`.magenta.bold.underline);
    console.log(`>>> App Loaded In: ${(Date.now() - now)}ms\n`.magenta.bold.underline);
});

client.on('error', (err) => {
    Commander.handleError(client, err);
});

client.login(process.env.BOT_TOKEN);

module.exports = client;