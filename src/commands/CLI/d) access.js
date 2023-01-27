module.exports = {
  name: 'access',
  group: 'CLI',
  usage: 'access <list|users|guilds> <add|remove> <command> [ids]',

  async run(client, args) {
    if (!client.database) return console.log('❌ Database Not Found.\n'.yellow);

    const argsArray = args.split(' ');

    if (argsArray[0] == 'list') {
      const command = argsArray[1];

      if (!command) return console.log(`❌ Invalid Arguments. ${this.usage}`.yellow);

      const data = await client.database.getAccess(command);

      console.log(`----- Command: ${command} -----`.green);

      if (!Object.keys(data).length) console.log('\nNo Data Found.'.yellow);

      if (data.guilds) console.log('\n--> Guilds:'.yellow + `\n${data.guilds.join(', \n')}`);

      if (data.users) console.log('\n--> Users:'.yellow + `\n${data.users.join(', \n')}`);

      return console.log('\n------------------------'.green);
    }

    if (argsArray[0] == 'users') {
      const action = argsArray[1];
      const command = argsArray[2];
      const users = argsArray.slice(3);

      if (!command || !action) return console.log(`❌ Invalid Arguments. ${this.usage}`.yellow);
      if (!users.length) return console.log(`❌ Invalid User IDs. ${this.usage}`.yellow);

      const data = await client.database.getAccess(command);

      if (action == 'add') {
        data.users ? data.users.push(...users) : data.users = users;
        await client.database.setAccess(command, data);
        return console.log(`✅ Added User(s) To Command (${command}): ${users.join(', ')}`.green);
      }

      if (action == 'remove') {
        if (!data.users) return console.log(`❌ No Users Found. ${this.usage}`.yellow);
        data.users = data.users.filter(user => !users.includes(user));
        await client.database.setAccess(command, data);
        return console.log(`✅ Removed User(s) From Command (${command}): ${users.join(', ')}`.green);
      }
    }

    if (argsArray[0] == 'guilds') {
      const action = argsArray[1];
      const command = argsArray[2];
      const guilds = argsArray.splice(3);

      if (!command || !action) return console.log(`❌ Invalid Arguments. ${this.usage}`.yellow);
      if (!guilds.length) return console.log(`❌ Invalid Guild IDs. ${this.usage}`.yellow);

      const data = await client.database.getAccess(command);

      if (action == 'add') {
        data.guilds ? data.guilds.push(...guilds) : data.guilds = guilds;
        await client.database.setAccess(command, data);
        return console.log(`✅ Added Guild(s) To Command (${command}): ${guilds.join(', ')}`.green);
      }

      if (action == 'remove') {
        if (!data.guilds) return console.log(`❌ No Guilds Found. ${this.usage}`.yellow);
        data.guilds = data.guilds.filter(guild => !guilds.includes(guild));
        await client.database.setAccess(command, data);
        return console.log(`✅ Removed Guild(s) From Command (${command}): ${guilds.join(', ')}`.green);
      }
    }

    return console.log(`❌ Invalid Arguments. ${this.usage}`.yellow);
  }
};