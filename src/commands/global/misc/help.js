!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="84ba7127-183c-590c-9ce9-4977558f5406")}catch(e){}}();
import { Command } from '../../../structures/index.js';
import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, } from 'discord.js';
export class HelpCommand extends Command {
    constructor(client, commander) {
        super(client, commander, {
            name: 'help',
            module: 'Misc',
            aliases: ['info'],
            legacy: true,
            description: {
                content: 'Stop it, get some help.',
            },
            ephemeral: true,
            allowDM: true,
        });
    }
    async execute(int) {
        const author = this.commander.getAuthor(int);
        const embed = new EmbedBuilder().setTitle('**Help Menu**').setDescription(`Select an option from the dropdown menu below.`);
        const menu = new StringSelectMenuBuilder().setCustomId('help_menu').setPlaceholder('Select a category');
        for (const module of this.client.commander.modules.values()) {
            if (!int.inGuild() && module.guilds)
                continue;
            if (module.guilds && !module.guilds.includes(int.guild?.id))
                continue;
            const commands = Array.from(module.commands.values()).filter((c) => !c.disabled && !c.hidden && (c.users ? c.users.includes(author.id) : true));
            if (commands.length)
                menu.addOptions(new StringSelectMenuOptionBuilder().setLabel(module.name + ' Commands').setValue(module.name));
        }
        const reply = await this.commander.reply(int, {
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(menu)],
        });
        const filter = (i) => i.isStringSelectMenu() && i.customId == 'help_menu' && i.message.id == reply.id && i.user.id == author.id;
        const collector = int.channel.createMessageComponentCollector({ filter, time: 60_000, max: 1 });
        collector.on('collect', async (i) => {
            const moduleName = i.values[0];
            const module = this.client.commander.modules.get(moduleName);
            let prefix = this.client.prefix;
            if (i.inCachedGuild())
                prefix = await this.client.cache.guilds.prefix(i.guild.id);
            embed.setFooter({ text: "Parameters with a '?' at the start are optional." });
            embed.setDescription(`Commands may also be run as slash commands.`);
            embed.addFields({
                name: module.name + ' Commands',
                value: Array.from(module.commands.values())
                    .filter((c) => !c.disabled && !c.hidden && (c.users ? c.users.includes(author.id) : true))
                    .map((c) => `\`${c.usage(prefix)}\` → ${c.description?.content}`)
                    .join('\n'),
            });
            this.commander.edit(int, reply, { embeds: [embed], components: [] });
        });
        collector.on('end', (collected, reason) => {
            if (!collected.size && reason == 'time') {
                this.commander.edit(int, reply, {
                    embeds: [embed],
                    components: [new ActionRowBuilder().addComponents(menu.setDisabled(true))],
                });
            }
        });
    }
}
//# debugId=84ba7127-183c-590c-9ce9-4977558f5406
//# sourceMappingURL=help.js.map
