const Discord = require('discord.js');
const Commander = require('@commander/commander');
const { failEmbed } = require('@utils/other/embeds');

class ColorManager {
    constructor(client, guild) {
        this.client = client;
        this.guild = guild;        
    }

    static async initialize(client, guild) {
        try {
            let manager = new ColorManager(client, guild);
            await manager.loadColors();
            client.colors.set(guild.id, manager);

            return manager;
        } catch (err) {
            Commander.handleError(client, err, false);
            console.error('ColorManager (ERROR) >> Error Creating'.red);
            console.error(err);
        }
    }

    async loadColors() {
        try {
            this.colors = await this.client.database.get(this.guild.id, 'colors') || [];
            this.colorHeader = await this.client.database.get(this.guild.id, 'colorHeaders') || [];
        } catch (err) {
            Commander.handleError(this.client, err, false);
            console.error('ColorManager (ERROR) >> Error Loading Colors'.red);
            console.error(err);
        }
    }

    createEmbed(int) {
        let embed = new Discord.MessageEmbed()
        .setTitle('Colors')
        .setDescription('Select a color to apply.')
        .setAuthor({ name: int.user.tag, iconURL: int.user.avatarURL({ dynamic: true }) });

        let color = this.getColor(int.member);

        if (color) {
            embed.setColor(color.hexColor);
            embed.addField('Current Color', `\`${color.name}\``);
        } else {
            embed.setColor('RANDOM');
        }

        return embed;
    }

    async createMenu(int) {
        let options = []

        for (const color of this.colors) {
            let role = await int.guild.roles.fetch(color);
            if (role && !int.member.roles.cache.has(color)) options.push({ label: role.name, value: role.id})
        }

        if (!options.length) return;

        let menu = new Discord.MessageSelectMenu()
        .setCustomId('menu')
        .setPlaceholder('Color options...')
        .addOptions(options);

        let row = new Discord.MessageActionRow()
        .addComponents(menu);

        await this.createListener(int);

        return row;
    }

    async createListener(int) {
        let filter = interaction => interaction.customId == 'menu' && interaction.user.id == int.user.id;
        let collector = int.channel.createMessageComponentCollector({ filter, max: 1, time: 30000 });

        collector.on('collect', async interaction => {
            if (this.colors.includes(interaction.values[0])) {
                let color = interaction.values[0];
            
                for (const color of this.colors) {
                    if (interaction.member.roles.cache.has(color)) await interaction.member.roles.remove(color);
                }

                if (this.colorHeader && !interaction.member.roles.cache.has(this.colorHeader)) {
                    let headerRole = await interaction.guild.roles.fetch(this.colorHeader);
                    if (headerRole) await interaction.member.roles.add(headerRole);
                }

                let role = await interaction.guild.roles.fetch(color);
                if (role) await interaction.member.roles.add(color);

                let success = new Discord.MessageEmbed()
                .setTitle('Colors')
                .setDescription('Your selected color was applied.')
                .addField('Color Applied', `\`${role.name}\``)
                .setColor(role.hexColor)
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) });

                return int.editReply({ embeds: [success], components: [] });
            } else {
                let fail = failEmbed('The color does not exist anymore!', interaction.user);
                return int.editReply({ embeds: [fail], components: [] });
            }
        });

        collector.on('end', interaction => {
            if (!collector.endReason) {
                let expired = failEmbed('The color menu has expired!', interaction.user);
                return int.editReply({ embeds: [expired], components: [] });
            }
        })
    }

    getColor(member) {
        if (!member) return null;

        for (const color of this.colors) {
            if (member.roles.cache.has(color)) return member.roles.cache.get(color);
        }
    }
}

module.exports = ColorManager;