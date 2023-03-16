import { EmbedBuilder, User } from 'discord.js';

export class ActionEmbed extends EmbedBuilder {
    public embed_type: "success" | "fail" | "load";
    public reply: string
    public author?: User;

    constructor(type: "success" | "fail" | "load", reply: string, author?: User) {
        super();

        this.embed_type = type;
        this.reply = reply;
        this.author = author;

        if (this.author) this.setAuthor({ name: this.author.tag, iconURL: this.author.avatarURL() ?? undefined });

        switch (type) {
            case 'success':
                this.setColor('Green');
                this.setDescription(`✅ \u200b ${reply}`);
                break;
            case 'fail':
                this.setColor('Red');
                this.setDescription(`🚫 \u200b ${reply}`);
                break;
            case 'load':
                this.setColor('Yellow');
                this.setDescription(`<a:loading:928668691997012028> \u200b ${reply}`);
                break;
            default:
                this.setColor('White');
                this.setDescription(`${reply}`);
        }
    }
}