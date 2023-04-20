import { Command } from "../../../structures/index.js";
import { SlashCommandBuilder } from "discord.js";
import { ActionEmbed } from "../../../utils/embeds/index.js";
// Add ability to see current volume next
export class VolumeCommand extends Command {
    constructor(client, commander) {
        super(client, commander, {
            name: "volume",
            group: "Music",
            legacy: true,
            legacyAliases: ["v"],
            description: {
                content: "View or set the music volume for the server.",
                format: "<?number>(0-100)",
            },
            cooldown: 5,
        });
    }
    data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content)
            .setDMPermission(false)
            .addStringOption((option) => option.setName("number").setDescription("The volume to set. (0-100)"));
    }
    async execute(int) {
        const args = this.getArgs(int)[0];
        if (!args) {
            const res = await this.client.cache.music.get(int.guildId);
            return this.reply(int, { embeds: [new ActionEmbed("success").setText(`The current volume is \`${res?.volume ?? 100}%\`!`)] });
        }
        const volume = parseInt(args);
        if (isNaN(volume))
            return this.reply(int, { embeds: [new ActionEmbed("fail").setText("Invalid volume provided!")] });
        if (volume < 0 || volume > 100)
            return this.reply(int, { embeds: [new ActionEmbed("fail").setText("Volume must be between `0` and `100`!")] });
        const res = await this.client.prisma.guild.upsert({
            where: {
                guildId: int.guildId,
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
                guildId: int.guildId,
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
        if (!res?.music)
            return this.reply(int, { embeds: [new ActionEmbed("fail").setText("An error occured while setting the volume!")] });
        this.client.cache.music.update(int.guildId, res.music);
        const subscription = this.client.subscriptions.get(int.guildId);
        if (subscription) {
            subscription.volume = res.music.volume;
            subscription.player.setVolume(res.music.volume / 100);
        }
        return this.reply(int, {
            embeds: [
                new ActionEmbed("success").setText(`Set the music volume to \`${res.music.volume}%\`!${subscription ? "\n```⚠️ It may take a few seconds to update the volume for the currently playing track.```" : ""}`),
            ],
        });
    }
}
