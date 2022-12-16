const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const Commander = require('@commander');

const ActionEmbed = require('@utils/embeds/action');

module.exports = {
    name: 'rewards',
    group: 'Rewards',
    description: 'Claim your Discord rewards.',
    guildOnly: true,

    // AUTHORIZATION
    guilds: [],

    // SLASH
    data() {
        return (
            new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
                .addSubcommand(sub => {
                    return sub.setName('claim')
                        .setDescription('Claim your rewards.');
                })
        );
    },

    async run(client, int) {
        if (!client.database) return int.editReply({ embeds: [new ActionEmbed('fail', 'Database not online!', int.user)] });

        const prefix = 'd:rewards_';
        
        const errorEmbed = new ActionEmbed('fail', 'An error occurred while claiming your rewards. A developer has been notified!', int.user);

        try {
            const steamId = await client.database.redis.hGet('asap:link', int.user.id);

            if (!steamId) {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setURL('https://link.asapgaming.co/')
                            .setLabel('Link Accounts')
                            .setStyle(ButtonStyle.Link)
                    );

                int.editReply({ embeds: [new ActionEmbed('fail', 'You have not linked your accounts yet. Click below to link your accounts!', int.user)], components: [row] });
            }

            const reward = await client.database.redis.hGet(prefix + steamId, 'discord');
            const boost = await client.database.redis.hGet(prefix + steamId, 'boost');
            const premium = int.member.premiumSince;

            if (!premium && reward == 1 || boost == 1) return int.editReply({ embeds: [new ActionEmbed('fail', 'You have already claimed all available rewards!', int.user)] });

            const row = new ActionRowBuilder();

            if (!reward || reward == 0) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId('discord')
                        .setLabel('Claim Join Reward')
                        .setStyle(ButtonStyle.Success)
                );
            }

            if (premium && (!boost || boost == 0)) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId('boost')
                        .setLabel('Claim Boost Reward')
                        .setStyle(ButtonStyle.Primary)
                );
            }

            const reply = await int.editReply({ embeds: [new ActionEmbed('success', 'Click the buttons below to claim your rewards!', int.user)], components: [row] });

            const filter = interaction => interaction.user.id == int.user.id;
            const collector = reply.createMessageComponentCollector({ filter, time: 30_000 });

            collector.on('collect', async i => {
                if (i.customId == 'discord') {
                    try {
                        await client.database.redis.hSet(prefix + steamId, 'discord', 1);
                        int.editReply({ embeds: [new ActionEmbed('success', 'Success! You can now claim your boost rewards in-game using the `!rewards` command!', int.user)], components: [] });
                    } catch (err) {
                        console.error('Guild Commands (ERROR): rewards: Error Claiming Join Reward');
                        console.error(err);
                        Commander.handleError(client, err, false, int.guild);

                        int.editReply({ embeds: [errorEmbed], components: [] });
                    }
                } else if (i.customId == 'boost') {
                    try {
                        await client.database.redis.hSet(prefix + steamId, 'boost', 1);
                        int.editReply({ embeds: [new ActionEmbed('success', 'Success! You can now claim your join rewards in-game using the `!rewards` command!', int.user)], components: [] });
                    } catch (err) {
                        console.error('Guild Commands (ERROR): rewards: Error Claiming Boost Reward');
                        console.error(err);
                        Commander.handleError(client, err, false, int.guild);

                        int.editReply({ embeds: [errorEmbed], components: [] });
                    }
                }
            });

            collector.on('end', () => {
                if (collector.endReason == 'time') int.editReply({ embeds: [new ActionEmbed('fail', 'You did not claim your rewards in time!', int.user)], components: [] });
            });
        } catch (err) {
            console.error('Guild Commands (ERROR): rewards');
            console.error(err);
            Commander.handleError(client, err, false, int.guild);

            int.editReply({ embeds: [errorEmbed], components: [] });
        }
    }
}; 