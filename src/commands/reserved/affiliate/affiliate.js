import { Command } from "../../../structures/index.js";
import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { ActionEmbed } from "../../../utils/embeds/action.js";
export class AffiliateCommand extends Command {
    constructor(client, commander) {
        super(client, commander);
        this.name = "affiliate";
        this.group = "Misc";
        this.module = "Affiliate";
        this.description = {
            content: "Create an affiliate link for a user.",
            format: "create <user>"
        };
        this.cooldown = 5;
    }
    data() {
        return new SlashCommandBuilder()
            .setName("affiliate")
            .setDescription(this.description?.content)
            .setDMPermission(false)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addSubcommand((subcommand) => subcommand
            .setName("create")
            .setDescription("Create an affiliate link.")
            .addUserOption((option) => option.setName("user").setDescription("The user to create an affiliate link for.").setRequired(true)));
    }
    async execute(int) {
        if (!int.member?.permissions.has(PermissionFlagsBits.Administrator))
            return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("You do not have permission to use this command!")] });
        const module = this.module;
        const command = int.options.getSubcommand();
        if (command === "create") {
            const user = int.options.getUser("user", true);
            if (!user || user.bot)
                return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("The user you provided is invalid!")] });
            const members = await int.guild?.members.fetch();
            if (!members?.has(user.id))
                return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("The user you provided is not in this server!")] });
            const affiliate = await module.createAffiliate(int.guild, user);
            if (!affiliate)
                return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("An error occured while creating the affiliate link!")] });
            const embed = new EmbedBuilder()
                .setColor("Green")
                .setTitle("Affiliate System")
                .setDescription(`Successfully created an affiliate link for \`${user.tag}\`!`)
                .addFields({ name: "Link", value: `\`${affiliate.link}\``, inline: true }, { name: "Inviter", value: `<@${affiliate.userId}>`, inline: true });
            this.reply(int, { embeds: [embed] });
        }
        else {
            this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("You did not provide a valid sub command!")] });
        }
    }
}
