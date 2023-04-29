import { KATClient as Client, Commander, Command } from '@structures/index.js';
import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { AffiliateModule } from '@modules/affiliate.js';
import { ActionEmbed } from '@utils/embeds/action.js';

export class AffiliateCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander, {
            name: 'affiliate',
            module: 'Affiliate',
            description: {
                content: 'Create an affiliate link for a user.',
                format: 'create <user>',
            },
            cooldown: 5,
        });
    }

    data() {
        return new SlashCommandBuilder()
            .setName('affiliate')
            .setDescription(this.description?.content!)
            .setDMPermission(false)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('create')
                    .setDescription('Create an affiliate link.')
                    .addUserOption((option) => option.setName('user').setDescription('The user to create an affiliate link for.').setRequired(true))
            ) as SlashCommandBuilder;
    }

    async execute(int: ChatInputCommandInteraction<'cached' | 'raw'>) {
        const module = this.module as AffiliateModule;
        const command = int.options.getSubcommand();

        if (command === 'create') {
            const user = int.options.getUser('user', true);
            if (!user || user.bot) return this.reply(int, { embeds: [new ActionEmbed('fail').setText('The user you provided is invalid!')] });

            const members = await int.guild?.members.fetch();
            if (!members?.has(user.id))
                return this.reply(int, {
                    embeds: [new ActionEmbed('fail').setText('The user you provided is not in this server!')],
                });

            const affiliate = await module.createAffiliate(int.guild!, user);
            if (!affiliate)
                return this.reply(int, {
                    embeds: [new ActionEmbed('fail').setText('An error occured while creating the affiliate link!')],
                });

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Affiliate System')
                .setDescription(`Successfully created an affiliate link for \`${user.tag}\`!`)
                .addFields(
                    { name: 'Link', value: `\`${affiliate.link}\``, inline: true },
                    { name: 'Inviter', value: `<@${affiliate.userId}>`, inline: true }
                );

            this.reply(int, { embeds: [embed] });
        } else {
            this.reply(int, { embeds: [new ActionEmbed('fail').setText('You did not provide a valid sub command!')] });
        }
    }
}
