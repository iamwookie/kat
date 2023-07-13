import { KATClient as Client, Commander, Command } from '@structures/index.js';
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    Interaction,
    ComponentType,
} from 'discord.js';

export class HelpCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander, {
            name: 'help',
            module: 'Misc',
            // Remove when shifting to slash commands.
            aliases: ['info'],
            description: {
                content: 'Stop it, get some help.',
            },
            ephemeral: true,
            allowDM: true,
        });
    }

    async execute(int: ChatInputCommandInteraction<'cached'>) {
        const embed = new EmbedBuilder().setTitle('**Help Menu**').setDescription(`Select an option from the dropdown menu below.`);
        const menu = new StringSelectMenuBuilder().setCustomId('help_menu').setPlaceholder('Select a category');

        for (const module of this.client.commander.modules.values()) {
            if (!int.inGuild() && module.guilds) continue;
            if (module.guilds && !module.guilds.includes(int.guild?.id!)) continue;

            const commands = Array.from(module.commands.values()).filter((c) => !c.disabled && !c.hidden && (c.users ? c.users.includes(int.user.id) : true));
            if (commands.length) menu.addOptions(new StringSelectMenuOptionBuilder().setLabel(module.name + ' Commands').setValue(module.name));
        }

        const reply = await int.editReply({ embeds: [embed], components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)] });
        const filter = (i: Interaction) => i.isStringSelectMenu() && i.customId == 'help_menu' && i.message.id == reply.id && i.user.id == int.user.id;
        const collector = int.channel!.createMessageComponentCollector<ComponentType.StringSelect>({ filter, time: 60_000, max: 1 });

        collector.on('collect', async (i) => {
            const moduleName = i.values[0];
            const module = this.client.commander.modules.get(moduleName);
            if (!module) return;

            embed.setFooter({ text: "Parameters with a '?' at the start are optional." });
            embed.addFields({
                name: module.name + ' Commands',
                value: Array.from(module.commands.values())
                    .filter((c) => !c.disabled && !c.hidden && (c.users ? c.users.includes(int.user.id) : true))
                    .map((c) => `\`${c.usage('/')}\` → ${c.description?.content}`)
                    .join('\n'),
            });

            int.editReply({ embeds: [embed], components: [] });
        });

        collector.on('end', (collected, reason) => {
            if (!collected.size && reason == 'time')
                int.editReply({ embeds: [embed], components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu.setDisabled(true))] });
        });
    }
}
