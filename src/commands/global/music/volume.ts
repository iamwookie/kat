import { KATClient as Client, Commander, Command } from "@structures/index.js";
import { SlashCommandBuilder, ChatInputCommandInteraction, Message } from "discord.js";
import { ActionEmbed } from "@utils/embeds/index.js";

// Add ability to see current volume next
export class VolumeCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander);

        this.name = "volume";
        this.group = "Music";

        this.legacy = true;
        this.legacyAliases = ["v"];

        this.description = {
            content: "Set the music volume for the server. (0-100)",
            format: "<number>",
        };

        this.cooldown = 5;
    }

    data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content!)
            .setDMPermission(false)
            .addStringOption((option) => option.setName("number").setDescription("The volume to set. (0-100)").setRequired(true));
    }

    async execute(int: ChatInputCommandInteraction | Message) {
        const args = this.getArgs(int)[0] as string;
        const volume = parseInt(args);

        if (isNaN(volume)) return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("Invalid volume provided!")] });
        if (volume < 0 || volume > 100) return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("Volume must be between `0` and `100`!")] });

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
                    }
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
            }
        });
        if (!res?.music) return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("An error occured while setting the volume!")] });

        const subscription = this.client.subscriptions.get(int.guildId!);
        if (subscription) {
            subscription.volume = res.music.volume;
            subscription.player.setVolume(res.music.volume / 100);
        }

        return this.reply(int, {
            embeds: [
                new ActionEmbed("success").setDesc(
                    `Set the music volume to \`${res.music.volume}\`!${subscription ? "\n```⚠️ It may take a few seconds to update the volume for the currently playing track.```" : ""}`
                ),
            ],
        });
    }
}
