import { KATClient as Client, Commander, Command } from '@structures/index.js';
import { SlashCommandBuilder, ChatInputCommandInteraction, Message, PermissionFlagsBits } from 'discord.js';
import { ActionEmbed } from '@utils/embeds/action.js';
import { PermissionPrompts } from '@structures/interfaces/Enums.js';

export class PrefixCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander, {
            name: 'prefix',
            module: 'Misc',
            legacy: true,
            description: {
                content: 'Set the chat prefix for your server. [Admin Only]',
                format: '<prefix>',
            },
            cooldown: 5,
        });
    }

    data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content!)
            .setDMPermission(false)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption((option) => option.setName('prefix').setRequired(true).setDescription('The prefix to set.'));
    }

    async execute(int: ChatInputCommandInteraction<'cached'> | Message<true>) {
        const author = this.commander.getAuthor(int);

        if (!this.client.isDev(author) && !int.member?.permissions.has(PermissionFlagsBits.Administrator))
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(PermissionPrompts.NotAllowed)] });

        const args = this.commander.getArgs(int)[0] as string;
        if (!args) {
            const prefix = await this.client.cache.guilds.prefix(int.guild.id);
            return this.commander.reply(int, {
                embeds: [new ActionEmbed('success').setText(`The current chat prefix is \`${prefix}\`. To set a new one, use: \`${this.usage(prefix)}\`.`)],
            });
        }

        const res = await this.client.prisma.guild.upsert({
            where: {
                guildId: int.guild!.id,
            },
            update: {
                prefix: args,
            },
            create: {
                guildId: int.guild!.id,
                prefix: args,
            },
        });

        this.client.cache.guilds.set(res.guildId, res);

        if (res) {
            this.commander.reply(int, { embeds: [new ActionEmbed('success').setText(`Successfully set the chat prefix to \`${res.prefix}\`!`)] });
        } else {
            this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText('An error occured while setting the prefix!')] });
        }
    }
}
