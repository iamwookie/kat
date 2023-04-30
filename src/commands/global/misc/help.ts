import { KATClient as Client, Commander, Command } from '@structures/index.js';
import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Message,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    Interaction,
    StringSelectMenuInteraction,
} from 'discord.js';

export class HelpCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander, {
            name: 'help',
            module: 'Misc',
            aliases: ['info'],
            legacy: true,
            description: {
                content: 'Stop it, get some help.',
            },
            ephemeral: true,
        });
    }

    data() {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description?.content!);
    }

    async execute(int: ChatInputCommandInteraction<'cached'> | Message<true>) {
        const author = this.getAuthor(int);
        const embed = new EmbedBuilder().setTitle('**Help Menu**').setDescription(`Select an option from the dropdown menu below.`);
        const menu = new StringSelectMenuBuilder().setCustomId('help_menu').setPlaceholder('Select a category');

        for (const module of this.client.commander.modules.values()) {
            if (module.guilds && !module.guilds.includes(int.guild?.id!)) continue;

            const commands = Array.from(module.commands.values()).filter(
                (c) => !c.disabled && !c.hidden && (c.users ? c.users.includes(author.id) : true)
            );
            if (commands.length) menu.addOptions(new StringSelectMenuOptionBuilder().setLabel(module.name + ' Commands').setValue(module.name));
        }

        const reply = await this.reply(int, {
            embeds: [embed],
            components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)],
        });
        const filter = (i: Interaction) => i.isStringSelectMenu() && i.customId == 'help_menu' && i.message.id == reply.id && i.user.id == author.id;
        const collector = int.channel?.createMessageComponentCollector({ filter, time: 60_000, max: 1 });

        collector?.on('collect', async (i: StringSelectMenuInteraction) => {
            const moduleName = i.values[0];
            const module = this.client.commander.modules.get(moduleName)!;

            const res = await this.client.cache.guilds.get(i.guild?.id!);
            const prefix = res?.prefix || this.client.legacyPrefix;

            embed.setFooter({ text: "Parameters with a '?' at the start are optional." });
            embed.setDescription(
                `As of right now, you may use some commands with the \`${prefix}\` prefix in chat. This may be removed in the future!`
            );
            embed.addFields({
                name: module.name + ' Commands',
                value: Array.from(module.commands.values())
                    .filter((c) => !c.disabled && !c.hidden && (c.users ? c.users.includes(author.id) : true))
                    .map((c) => `\`${c.usage}\` → ${c.description?.content}`)
                    .join('\n'),
            });

            this.edit(int, reply, { embeds: [embed], components: [] });
        });

        collector?.on('end', (collected, reason) => {
            if (!collected.size && reason == 'time') {
                this.edit(int, reply, {
                    embeds: [embed],
                    components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu.setDisabled(true))],
                });
            }
        });
    }
}
