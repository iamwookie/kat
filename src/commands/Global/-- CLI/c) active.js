module.exports = {
    name: 'active',
    group: 'CLI',
    
    async run(client) {
        if (!client.subscriptions) console.log('❌ Subscriptions Not Found.\n'.yellow);
        
        if (client.subscriptions.size) {
            console.log('Playing:'.brightGreen.bold);
    
            let c = 1;
            client.subscriptions.forEach(sub => {
                console.log(`${c}) ${sub.guild.name} (${sub.guild.id})`);
            })
        } else {
            console.log('No Subscriptions Found.'.yellow);
        }
    }
};