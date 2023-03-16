import Config from '@configs/bot.json' assert { type: 'json' };

import { Client, ClientOptions, Collection, PermissionsBitField } from 'discord.js';
import { Logger } from './Logger.js';
import { Commander } from './Commander.js';

const perms = 

export class KATClient extends Client {
    public perms: PermissionsBitField = new PermissionsBitField([
        // GENERAL
        PermissionsBitField.Flags.ViewChannel,
        // TEXT
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.EmbedLinks,
        PermissionsBitField.Flags.AttachFiles,
        PermissionsBitField.Flags.ReadMessageHistory,
        PermissionsBitField.Flags.UseExternalEmojis,
        PermissionsBitField.Flags.UseExternalStickers,
        PermissionsBitField.Flags.AddReactions,
        // VOICE
        PermissionsBitField.Flags.Connect,
        PermissionsBitField.Flags.Speak,
        PermissionsBitField.Flags.UseVAD,
    ]);

    public devId: string = Config.devId;
    public prefix: string = Config.prefix;

    public logger: Logger = new Logger(this);
    public commander: Commander = new Commander(this);

    public subscriptions: Collection<any, any> = new Collection();
    public colors: Collection<any, any> = new Collection();

    constructor(options: ClientOptions) {
        super(options);
    }
}
