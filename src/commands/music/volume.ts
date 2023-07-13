import { Command, KATClient as Client, Commander, PermissionPrompts } from '@structures/index.js';
import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { ActionEmbed } from '@utils/embeds/index.js';

export class VolumeCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander, {
            name: 'volume',
            module: 'Music',
            // Remove when shifting to slash commands.
            aliases: ['v'],
            description: {
                content: 'View or set the server music volume. [Admin Only]',
                format: '<?number>(0-100)',
            },
            cooldown: 5,
            ephemeral: true,
        });
    }

    data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content!)
            .setDMPermission(false)
            .addStringOption((option) => option.setName('number').setDescription('The volume to set. (0-100)'));
    }

    async execute(int: ChatInputCommandInteraction<'cached'>) {
        const args = int.options.getString('number');

        if (!args) {
            const res = await this.client.cache.music.get(int.guildId);
            return int.editReply({ embeds: [new ActionEmbed('success').setText(`The current volume is \`${res?.volume ?? 100}%\`!`)] });
        }

        if (!this.client.isDev(int.user) && !int.member.permissions.has(PermissionFlagsBits.Administrator))
            return int.editReply({ embeds: [new ActionEmbed('fail').setText(PermissionPrompts.NotAllowed)] });

        const volume = parseInt(args);
        if (isNaN(volume)) return int.editReply({ embeds: [new ActionEmbed('fail').setText('Invalid volume provided!')] });
        if (volume < 0 || volume > 100)
            return int.editReply({ embeds: [new ActionEmbed('fail').setText('Volume must be between `0` and `100`!')] });

        const res = await this.client.prisma.guild.upsert({
            where: {
                guildId: int.guildId!,
            },
            update: {
                music: {
                    upsert: {
                        update: {
                            volume: volume,
                        },
                        create: {
                            volume: volume,
                        },
                    },
                },
            },
            create: {
                guildId: int.guildId!,
                music: {
                    create: {
                        volume: volume,
                    },
                },
            },
            select: {
                music: true,
            },
        });
        if (!res?.music) return int.editReply({ embeds: [new ActionEmbed('fail').setText('An error occured while setting the volume!')] });

        this.client.cache.music.set(int.guildId!, res.music);

        const subscription = this.client.dispatcher.getSubscription(int.guild);
        if (subscription) {
            subscription.volume = res.music.volume;
            subscription.player.setVolume(res.music.volume / 100);
        }

        int.editReply({
            embeds: [
                new ActionEmbed('success').setText(
                    `Set the music volume to \`${res.music.volume}%\`!${
                        subscription ? '\n```⚠️ It may take a few seconds to update the volume for the currently playing track.```' : ''
                    }`
                ),
            ],
        });
    }
}
