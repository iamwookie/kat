import { EmbedBuilder } from 'discord.js';
export class ActionEmbed extends EmbedBuilder {
    embedType;
    constructor(embedType) {
        super();
        this.embedType = embedType;
        this.embedType = embedType;
    }
    setUser(user) {
        return super.setAuthor({ name: user.tag, iconURL: user.avatarURL() ?? undefined });
    }
    setDesc(description) {
        switch (this.embedType) {
            case 'success':
                super.setColor('Green');
                super.setDescription(`✅ \u200b ${description}`);
                break;
            case 'fail':
                super.setColor('Red');
                super.setDescription(`🚫 \u200b ${description}`);
                break;
            default:
                super.setDescription(`${description}`);
        }
        return this;
    }
}
