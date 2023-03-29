import { EmbedBuilder, User } from 'discord.js';

export class ActionEmbed extends EmbedBuilder {
    constructor(
        public embedType?: "success" | "fail" | "warn"
    ) {
        super();

        this.embedType = embedType;
    }

    public setUser(user: User) {
        return super.setAuthor({ name: user.tag, iconURL: user.avatarURL() ?? undefined });
    }

    public setDesc(description: string | null) {
        switch (this.embedType) {
            case 'success':
                super.setColor('Green');
                super.setDescription(`✅ \u200b ${description}`);
                break;
            case 'fail':
                super.setColor('Red');
                super.setDescription(`🚫 \u200b ${description}`);
                break;
            case 'warn':
                super.setColor('Yellow');
                super.setDescription(`⚠️ \u200b ${description}`);
                break;
            default:
                super.setDescription(`${description}`);
        }

        return this;
    }
}