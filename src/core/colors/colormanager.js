const Discord = require("discord.js");
const colors = [

]

class ColorManager {
    constructor(client) {
        this.client = client;
        this.guild = await client.guilds.fetch('')
        this.colors = [];

        client.colors = new Discord.Collection();
    }

    static initialize() {
        try {
            let manager = new ColorManager(client);
            client.colors.set(this.guild.id, manager);
        } catch {
            
        }
        
    }
}