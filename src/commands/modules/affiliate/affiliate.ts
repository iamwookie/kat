import { KATClient as Client, Commander, Command } from "@structures/index.js";
import { SlashCommandBuilder, ChatInputCommandInteraction, Message, Embed, EmbedBuilder, Permissions, PermissionFlagsBits } from "discord.js";
import { AffiliateModule } from "@modules/affiliate.js";
import { ActionEmbed } from "@utils/embeds/action.js";

export class AddAffiliateCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander);

        this.name = "affiliate";
        this.group = "Music";
        this.module = "Affiliate";
        this.description = {
            content: "Interaction with the affiliate system.",
        };

        this.cooldown = 5;
    }

    data() {
        return new SlashCommandBuilder()
            .setName("affiliate")
            .setDescription(this.description?.content!)
            .setDMPermission(false)
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("create")
                    .setDescription("Create an affiliate link.")
                    .addUserOption((option) => option.setName("user").setDescription("The user to create an affiliate link for.").setRequired(true))
            ) as SlashCommandBuilder;
    }

    async execute(int: ChatInputCommandInteraction<"cached"> | Message) {
        if (!int.member?.permissions.has(PermissionFlagsBits.Administrator)) return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("You do not have permission to use this command!")] });

        const module = this.module as AffiliateModule;
        const command = int instanceof ChatInputCommandInteraction ? int.options.getSubcommand() : this.getArgs(int).shift();

        // Might be better ways to do this
        const args = this.getArgs(int) as any;

        if (command === "create") {
            const userId = typeof args[1] === "string" ? args[1] : args[0].user?.id;
            const user = this.client.users.cache.get(userId);
            if (!user || !int.guild?.members.cache.has(userId) || user.bot) return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("That user you provided is invalid!")] });

            const affiliate = await module.createAffiliate(int.guild, user);
            if (!affiliate) return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("An error occured while creating the affiliate link!")] });

            const embed = new EmbedBuilder()
                .setColor("Green")
                .setTitle("Affiliate System")
                .setDescription(`Successfully created an affiliate link for \`${user.tag}\`!`)
                .addFields(
                    { name: "Link", value: `\`${affiliate.link}\``, inline: true },
                    { name: "Inviter", value: `<@${affiliate.userId}>`, inline: true }
                )
            
            this.reply(int, { embeds: [embed] });
        } else {
            this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("You did not provide a valid sub command!")] });
        }
    }
}
