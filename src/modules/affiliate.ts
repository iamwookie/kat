import { Module, KATClient as Client, Commander } from "@structures/index.js";
import { Collection, Client as DiscordClient, EmbedBuilder, Guild, GuildMember, Invite, Snowflake, User } from "discord.js";
import { Affiliate } from "@prisma/client";

export class AffiliateModule extends Module {
    public name: string;
    public guilds?: Snowflake[];
    public invites: Collection<Snowflake, Collection<string, number>> = new Collection();
    public channels: Collection<Snowflake, Snowflake[]> = new Collection();

    constructor(client: Client, commander: Commander) {
        super(client, commander);

        this.name = "Affiliate";
        this.guilds = ["1094860861505544314"];

        // In future, will be handled by db
        this.channels.set("1094860861505544314", ["1094861185310011412"]);
    }

    async onReady(client: DiscordClient) {
        // make this async
        const guilds = this.client.guilds.cache.filter((guild) => this.guilds?.includes(guild.id));
        if (!guilds.size) return;

        for (const guild of guilds.values()) {
            const invites = await guild.invites.fetch();
            this.invites.set(guild.id, new Collection(invites.map((invite) => [invite.code, invite.uses ?? 0])));
        }
    }

    async onInviteCreate(invite: Invite) {
        this.invites.get(invite.guild?.id!)?.set(invite.code, invite.uses ?? 0);
    }

    async onGuildCreate(guild: Guild) {
        if (!this.guilds?.includes(guild.id)) return;

        const invites = await guild.invites.fetch();
        this.invites.set(guild.id, new Collection(invites.map((invite) => [invite.code, invite.uses ?? 0])));
    }

    async onGuildMemberAdd(member: GuildMember) {
        const newInvites = await member.guild.invites.fetch();
        const oldInvites = this.invites.get(member.guild.id);
        this.invites.set(member.guild.id, new Collection(newInvites.map((invite) => [invite.code, invite.uses ?? 0])));

        // Might be risky if invite does not exist
        const invite = newInvites.find((invite) => (oldInvites?.get(invite.code) ?? 0) < (invite.uses ?? 0))!;

        try {
            const res = await this.client.prisma.affiliate.findUnique({
                where: {
                    link: invite.url,
                },
            });
            if (!res) return;

            const affiliate = await this.client.prisma.affiliate.update({
                where: {
                    link: invite.url,
                },
                data: {
                    total: invite.uses!,
                },
            });
            if (!affiliate) return;

            this.client.logger.info(`Module (${this.name}) >> Updated Affiliate Invite Link: ` + affiliate.link + " | Total: " + affiliate.total);

            this.sendNotification(member, affiliate);
        } catch (err) {
            this.client.logger.error(err);
            console.error(`Module (${this.name}) (ERROR) >> Error Registering Invite`);
            console.error(err);
        }
    }

    async sendNotification(member: GuildMember, affiliate: Affiliate) {
        const channels = this.channels.get(member.guild.id);
        if (!channels) return;

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("🔗 Affiliate System")
            .setDescription(`A new user has joined!`)
            .setThumbnail(member.user.avatarURL() ?? null)
            .addFields(
                { name: "User", value: member.user.toString(), inline: true },
                { name: "Inviter", value: `<@${affiliate.userId}>`, inline: true },
                { name: "Total Invites", value: `\`${affiliate.total}\``, inline: true }
            );

        for (const channelId of channels) {
            const channel = member.guild.channels.cache.get(channelId);
            // Could add proper handling later
            if (channel && channel.isTextBased()) channel.send({ embeds: [embed] }).catch(() => {});
        }
    }

    async createAffiliate(guild: Guild, user: User) {
        try {
            const res = await this.client.prisma.affiliate.findFirst({
                where: {
                    userId: user.id,
                },
            });
            if (res) return res;

            const channel = guild?.channels.cache.find((channel) => channel.isTextBased());
            if (!channel) return null;

            const invite = await guild?.invites.create(channel?.id, { maxAge: 0, maxUses: 0, unique: true });
            
            const affiliate = await this.client.prisma.affiliate.create({
                data: {
                    link: invite.url,
                    guildId: guild.id,
                    userId: user.id,
                    total: 0,
                },
            });

            this.client.logger.info(`Module (${this.name}) >> Created Affiliate Invite Link: ` + affiliate.link + " | Guild: " + affiliate.guildId + " | User: " + affiliate.userId);

            return affiliate;
        } catch (err) {
            this.client.logger.error(err);
            console.error(`Module (${this.name}) (ERROR) >> Error Creating Invite`);
            console.error(err);

            return null;
        }
    }
}
