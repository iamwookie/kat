// ------------------------------------
import dotenv from 'dotenv';
dotenv.config();
// ------------------------------------
import { PermissionsBitField } from 'discord.js';

export const version = '8.2.0';

export const devs = ['244662779745665026'];

export const bot = {
    prefix: process.env.NODE_ENV != 'production' ? '!' : '.',
    permissions: {
        text: new PermissionsBitField([
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.EmbedLinks,
            PermissionsBitField.Flags.AttachFiles,
            PermissionsBitField.Flags.ReadMessageHistory,
            PermissionsBitField.Flags.UseExternalEmojis,
            PermissionsBitField.Flags.UseExternalStickers,
            PermissionsBitField.Flags.AddReactions,
        ]),
        voice: new PermissionsBitField([
            PermissionsBitField.Flags.Connect,
            PermissionsBitField.Flags.Speak,
            PermissionsBitField.Flags.UseVAD,
        ]),
    },
};

export const cache = {
    guildTimeout: 300, // The time in seconds when the guild cache will expire
    musicTimeout: 300, // The time in seconds when the music cache will expire
    queueTimeout: 300, // The time in seconds when the queue cache will expire
};

export const server = {
    port: 3030,
    limiter: {
        duration: 5,
        max: 50,
    },
};

export const music = {
    inactiveDuration: 300_000, // The time in milliseconds before the bot leaves the voice channel
};

export const lavalink = {
    nodes: [
        {
            name: 'uk:london-1',
            url: process.env.LAVALINK_HOST,
            auth: process.env.LAVALINK_AUTH,
            secure: true,
        },
    ],
};
