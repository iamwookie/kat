const Discord = require('discord.js');
const Commander = require('@commander');
const ActionEmbed = require('@utils/embeds/action');

class ColorManager {
    constructor(client, guild) {
        this.client = client;
        this.guild = guild;
    }

    static async initialize(client, guild) {
        try {
            const manager = new ColorManager(client, guild);
            await manager.#loadColors();
            client.colors.set(guild.id, manager);

            return manager;
        } catch (err) {
            console.error('ColorManager (ERROR) >> Error Creating'.red);
            console.error(err);

            this.client.logger?.error(err);
        }
    }

    // Private

    async #loadColors() {
        try {
            this.colors = this.client.database ? await this.client.database.get(this.guild.id, 'colors') || [] : [];
        } catch (err) {
            console.error('ColorManager (ERROR) >> Error Loading Colors'.red);
            console.error(err);

            this.client.logger?.error(err);
        }
    }

    async #createListener(int) {
        const filter = interaction => interaction.customId == 'menu' && interaction.user.id == int.user.id;
        const collector = int.channel.createMessageComponentCollector({ filter, max: 1, time: 30_000 });

        collector.on('collect', async interaction => {
            if (this.colors.includes(interaction.values[0])) {
                let color = interaction.values[0];

                for (const color of this.colors) {
                    if (interaction.member.roles.cache.has(color)) await interaction.member.roles.remove(color);
                }

                const role = await interaction.guild.roles.fetch(color);
                if (role) await interaction.member.roles.add(color);

                const success = new Discord.EmbedBuilder()
                    .setTitle('Colors')
                    .setDescription('Your selected color was applied.')
                    .addFields([{ name: 'Color Applied', value: `\`${role.name}\`` }])
                    .setColor(role.hexColor)
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) });

                return int.editReply({ embeds: [success], components: [] });
            } else {
                return int.editReply({ embeds: [new ActionEmbed('fail', 'The color does not exist anymore!', interaction.user)], components: [] });
            }
        });

        collector.on('end', interaction => {
            if (collector.endReason == 'time') return int.editReply({ embeds: [new ActionEmbed('fail', 'The color menu has expired!', interaction.user)], components: [] });
        });
    }

    #getColor(member) {
        for (const color of this.colors) {
            if (member?.roles.cache.has(color)) return member?.roles.cache.get(color);
        }
    }

    // Public

    async createMenu(int) {
        const embed = new Discord.EmbedBuilder()
            .setTitle('Colors')
            .setDescription('Select a color to apply.')
            .setAuthor({ name: int.user.tag, iconURL: int.user.avatarURL({ dynamic: true }) });

        const color = this.#getColor(int.member);

        if (color) {
            embed.setColor(color.hexColor);
            embed.addFields([{ name: 'Current Color', value: `\`${color.name}\`` }]);
        } else {
            embed.setColor('Random');
        }

        let options = [];

        for (const color of this.colors) {
            let role = await int.guild.roles.fetch(color);
            if (role && !int.member.roles.cache.has(color)) options.push({ label: role.name, value: role.id });
        }

        if (!options.length) return;

        const menu = new Discord.SelectMenuBuilder()
            .setCustomId('menu')
            .setPlaceholder('Color options...')
            .addOptions(options);

        const row = new Discord.ActionRowBuilder()
            .addComponents(menu);

        await this.#createListener(int);

        return [embed, row];
    }

    async addColor(role) {
        try {
            if (this.colors.includes(role.id)) return role;

            this.colors.push(role.id);
            await this.client.database.set(role.guild.id, 'colors', this.colors);

            return role;
        } catch (err) {
            console.error('ColorManager (ERROR) >> Error Adding Color'.red);
            console.error(err);

            this.client.logger?.error(err);
        }
    }


}

module.exports = ColorManager;