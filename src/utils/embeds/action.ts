import { EmbedBuilder, User } from 'discord.js';

export class ActionEmbed extends EmbedBuilder {
    constructor(public embedType?: 'success' | 'fail' | 'warn') {
        super();

        this.embedType = embedType;
    }

    public setText(content: string) {
        switch (this.embedType) {
            case 'success':
                super.setColor('Green');
                super.setDescription(`✅ \u200b ${content}`);
                break;
            case 'fail':
                super.setColor('Red');
                super.setDescription(`🚫 \u200b ${content}`);
                break;
            case 'warn':
                super.setColor('Yellow');
                super.setDescription(`⚠️ \u200b ${content}`);
                break;
            default:
                super.setDescription(content);
        }

        return this;
    }
}
