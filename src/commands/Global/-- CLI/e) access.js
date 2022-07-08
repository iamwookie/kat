const Commander = require('@commander');

module.exports = {
  name: 'access',
  group: 'CLI',

  async run(client, args) {
    if (!client.database) return console.log('❌ Database Not Found.\n'.yellow);

    const argsArray = args.split(' ');

    if (argsArray[0] == 'users') {
      const command = argsArray[1];
      const users = argsArray.splice(2);

      if (!command) return console.log('❌ Invalid Arguments.'.yellow);
      if (!users.length) return console.log('❌ Invalid User IDs.'.yellow);

      let data = await client.database.getAccess(command);
      data.users ? data.users.push(...users) : data.users = users;

      await client.database.setAccess(command, data);

      return console.log(`✅ Added Users To Command (${command}): ${users.join(', ')}`.green);
    }

    if (argsArray[0] == 'guilds') {
      const command = argsArray[1];
      const guilds = argsArray.splice(2);

      if (!command) return console.log('❌ Invalid Arguments.'.yellow);
      if (!guilds.length) return console.log('❌ Invalid Guild IDs.'.yellow);

      let data = await client.database.getAccess(command);
      data.guilds ? data.guilds.push(...guilds) : data.guilds = guilds;

      await client.database.setAccess(command, data);

      return console.log(`✅ Added Guilds To Command (${command}): ${guilds.join(', ')}`.green);
    }

    console.log('❌ Invalid Arguments.'.yellow);
  }
};;