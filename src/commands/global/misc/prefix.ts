import { KATClient as Client, Commander, Command } from '@structures/index.js';
import { SlashCommandBuilder, ChatInputCommandInteraction, Message, PermissionFlagsBits } from 'discord.js';
import { ActionEmbed } from '@utils/embeds/action.js';
import { PermissionPrompts } from 'enums.js';

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
        const author = this.getAuthor(int);

        if (!this.client.isDev(author) && !int.member?.permissions.has(PermissionFlagsBits.Administrator))
            return this.reply(int, { embeds: [new ActionEmbed('fail').setText(PermissionPrompts.NotAllowed)] });

        const args = this.getArgs(int)[0] as string;
        if (!args) return this.reply(int, { embeds: [new ActionEmbed('fail').setText('You did not provide a valid prefix!')] });

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

        this.client.cache.guilds.update(res.guildId, res);

        if (res) {
            this.reply(int, { embeds: [new ActionEmbed('success').setText(`Successfully set the prefix to \`${res.prefix}\`!`)] });
        } else {
            this.reply(int, { embeds: [new ActionEmbed('fail').setText('An error occured while setting the prefix!')] });
        }
    }
}
