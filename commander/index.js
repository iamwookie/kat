// This is the command handler, CODENAME: Commander v6.1.0

const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { failEmbed } = require('@utils/other/embeds');

// -----------------------------------
const perms = [ // 137476033600
  // GENERAL
  Discord.PermissionFlagsBits.ViewChannel,
  // TEXT
  Discord.PermissionFlagsBits.SendMessages,
  Discord.PermissionFlagsBits.EmbedLinks,
  Discord.PermissionFlagsBits.AttachFiles,
  Discord.PermissionFlagsBits.ReadMessageHistory,
  Discord.PermissionFlagsBits.UseExternalEmojis,
  Discord.PermissionFlagsBits.UseExternalStickers,
  Discord.PermissionFlagsBits.AddReactions,
  // VOICE
  Discord.PermissionFlagsBits.Connect,
  Discord.PermissionFlagsBits.Speak,
  Discord.PermissionFlagsBits.UseVAD
];

class Commander {
  constructor(client) {
    this.client = client;
    this.prefix = client.prefix;
    this.readline = readline.createInterface(process.stdin);

    this.global = new Discord.Collection();
    this.guilds = new Discord.Collection();

    // Commands

    this.commands = new Discord.Collection();
    this.aliases = new Discord.Collection();
    this.cooldowns = new Discord.Collection();
    this.groups = new Discord.Collection();

    // Music

    this.client.subscriptions = this.client.subscriptions || new Discord.Collection();

    // Guilds
    this.client.linkSessions = this.client.linkSessions || new Discord.Collection();

    // Colors
    this.client.colors = this.client.colors || new Discord.Collection();

    // CLI Commands
    this.readline.on('line', async line => {
      if (!line.startsWith('>')) return;

      const content = line.slice(1).trim().split(/ +/);
      const commandText = content.shift().toLowerCase();
      const args = content.join(' ');

      const command = this.groups.get('CLI').get(commandText) || this.groups.get('CLI').get(this.aliases.get(commandText));
      if (!command || command.disabled) return;

      try {
        await command.run(this.client, args);
        // Breakline
        console.log('');
      } catch (err) {
        console.error('Commander (ERROR) >> Error Running CLI Command'.red);
        console.error(err);
        Commander.handleError(this.client, err, false);
      }
    });

    // Discord Commands
    this.client.on('interactionCreate', async interaction => {
      if (interaction.type !== Discord.InteractionType.ApplicationCommand) return;

      await interaction.deferReply();

      const command = this.commands.get(interaction.commandName) || this.commands.get(this.aliases.get(interaction.commandName));
      if (!command || command.disabled) {
        let notFound = failEmbed('This command has been disabled or removed!', interaction.user);
        return interaction.editReply({ embeds: [notFound] });
      }

      if (!this.authenticate(interaction, command)) return;

      let cooldown = command.getCooldown(interaction.guild, interaction.user);
      if (cooldown) {
        let wait = failEmbed(`Please wait \`${cooldown}\` seconds before using that command again!`, interaction.user);
        return interaction.editReply({ embeds: [wait] });
      }

      try {
        await command.run(this.client, interaction);
      } catch (err) {
        console.error('Commander (ERROR) >> Error Running Slash Command'.red);
        console.error(err);
        Commander.handleError(this.client, err, false, interaction.guild);
      }
    });
  }

  static async initialize(client) {
    try {
      let commander = new Commander(client);
      await commander.registerGlobalCommands();
      await commander.registerGuildCommands();
      commander.registerModules();
      console.log('>>> Commander Initialized'.brightGreen.bold.underline);

      return commander;
    } catch (err) {
      console.error('Commander (ERROR) >> Error Initializing'.red);
      console.error(err);
      Commander.handleError(client, err, true);
    }
  }

  async registerGlobalCommands() {
    const globalPath = path.join(__dirname, '../src', 'commands', 'Global');
    const globalFolders = fs.existsSync(globalPath) ? fs.readdirSync(globalPath) : [];

    if (globalFolders.length) {
      for (const folder of globalFolders) {
        const globalFiles = fs.readdirSync(`${globalPath}/${folder}`).filter(file => file.endsWith('.js'));

        for (const file of globalFiles) {
          delete require.cache[require.resolve(`${globalPath}/${folder}/${file}`)];

          const object = require(`${globalPath}/${folder}/${file}`);
          const command = new CommanderCommand(object, this);
          await command.initialize();

          this.commands.set(command.name, command);
        }
      }
    }
  }

  async registerGuildCommands() {
    const guildPath = path.join(__dirname, '../src', 'commands', 'Guild');
    const guildFolders = fs.existsSync(guildPath) ? fs.readdirSync(guildPath) : [];

    if (guildFolders.length) {
      for (const folder of guildFolders) {
        const guildSubFolders = fs.readdirSync(`${guildPath}/${folder}`);

        for (const subFolder of guildSubFolders) {
          const guildFiles = fs.readdirSync(`${guildPath}/${folder}/${subFolder}`).filter(file => file.endsWith('.js'));

          for (const file of guildFiles) {
            delete require.cache[require.resolve(`${guildPath}/${folder}/${subFolder}/${file}`)];

            const object = require(`${guildPath}/${folder}/${subFolder}/${file}`);
            const command = new CommanderCommand(object, this);
            if (!command.guilds) console.warn(`Commander (WARNING) >> Guild Not Set For Guild Command: ${command.name}`.yellow);
            await command.initialize();

            this.commands.set(command.name, command);
          }
        }
      }
    }
  }

  async updateCommands() {
    try {
      let commands = [];

      for (const [_, command] of this.global) {
        if (!command.data || command.disabled || command.hidden) continue;

        if (command.aliases) {
          for (const alias of command.aliases) {
            let data = command.data().setName(alias);
            commands.push(data);
          }
        }

        commands.push(command.data().toJSON());
      }

      if (commands.length) await this.client.application.commands.set(commands);
      console.log('Commander >> Successfully Registered Global Commands.'.brightGreen);
    } catch (err) {
      console.error('Commander (ERROR) >> Error Registering Global Slash Commands'.red);
      console.error(err);
      Commander.handleError(this.client, err, false);
    }

    try {
      for (const [k, g] of this.guilds) {
        let commands = [];

        for (const [_, command] of g.commands) {
          if (!command.data || command.disabled || command.hidden) continue;

          if (command.aliases) {
            for (const alias of command.aliases) {
              let data = command.data().setName(alias);
              commands.push(data);
            }
          }

          commands.push(command.data().toJSON());
        }

        const guild = this.client.guilds.cache.get(k);
        if (commands.length && guild) await guild.commands.set(commands).catch(err => {
          console.error(`Commander (ERROR) >> Error Registering Guild Slash Commands For: ${guild.id}`.red);
          console.error(err);
        });
      }
      console.log('Commander >> Successfully Registered Guild Commands.'.brightGreen);
    } catch (err) {
      console.error('Commander (ERROR) >> Error Registering Guild Slash Commands'.red);
      console.error(err);
      Commander.handleError(this.client, err, false);
    }
  }

  registerModules() {
    const globalPath = path.join(__dirname, '../src', 'modules', 'Global');
    const guildPath = path.join(__dirname, '../src', 'modules', 'Guild');
    const globalFolders = fs.existsSync(globalPath) ? fs.readdirSync(globalPath) : [];
    const guildFolders = fs.existsSync(guildPath) ? fs.readdirSync(guildPath) : [];

    this.modules = new Discord.Collection();

    if (globalFolders.length) {
      for (const folder of globalFolders) {
        const globalFiles = fs.readdirSync(`${globalPath}/${folder}`).filter(file => file.endsWith('.js'));

        for (const file of globalFiles) {
          delete require.cache[require.resolve(`${globalPath}/${folder}/${file}`)];

          const object = require(`${globalPath}/${folder}/${file}`);
          const module = new CommanderModule(object, this);

          module.initialize(this.client);

          this.modules.set(module.name, module);
        }
      }
    }

    if (guildFolders.length) {
      for (const folder of guildFolders) {
        const guildSubFolders = fs.readdirSync(`${guildPath}/${folder}`);

        for (const subFolder of guildSubFolders) {
          const guildFiles = fs.readdirSync(`${guildPath}/${folder}/${subFolder}`).filter(file => file.endsWith('.js'));

          for (const file of guildFiles) {
            delete require.cache[require.resolve(`${guildPath}/${folder}/${subFolder}/${file}`)];

            const object = require(`${guildPath}/${folder}/${subFolder}/${file}`);
            const module = new CommanderModule(object, this);
            if (!module.guilds || !module.guilds.includes(folder)) console.warn(`Commander (WARNING) >> Guild Not Set For Guild Module: ${module.name}`.yellow);

            module.initialize(this.client);

            this.modules.set(module.name, module);
          }
        }
      }
    }
  }

  validate(msg) {
    if (!msg.guild) return true;

    if (!msg.guild.me.permissions.has(perms)) {
      let noPerms = failEmbed('I don\'t have enough permissions in this server. Try contacting an admin!');
      msg.author.send({ embeds: [noPerms] }).catch(err => {
        console.error('Commander (ERROR) >> Could Not Send Permission Warning To User'.red);
        console.error(err);
      });

      return false;
    }

    if (!msg.channel.permissionsFor(this.client.user).has(perms)) {
      let noPerms = failEmbed('I don\'t have enough permissions to type in that channel!');
      msg.author.send({ embeds: [noPerms] }).catch(err => {
        console.error('Commander (ERROR) >> Could Not Send Permission Warning To User'.red);
        console.error(err);
      });

      return false;
    };

    return true;
  }

  authenticate(interaction, command) {
    if (command.users && !command.users.includes(interaction.user.id)) {
      let notAllowed = failEmbed('You are not allowed to use this command!', interaction.user);
      interaction.editReply({ embeds: [notAllowed] });
      return false;
    }

    if (command.guildOnly && !interaction.inGuild()) {
      let notGuild = failEmbed('This command can not be used in DMs!', interaction.user);
      interaction.editReply({ embeds: [notGuild] });
      return false;
    }

    return true;
  }

  // Error Handling

  static async handleError(client, err, quit, guild) {
    let dev = client ? await client.users.fetch(client.dev).catch(() => { return; }) : null;
    let code = Date.now();

    let errorObject = {
      errorName: err.name,
      errorMessage: err.message,
      errorStack: err.stack,
      guild: guild ? guild : "N/A",
    };

    fs.appendFile('./error.log', `${code}: ${JSON.stringify(errorObject)}\n`, async (err) => {
      if (err) throw err;

      if (dev) {
        let embed = new Discord.EmbedBuilder()
          .setColor('#F04947')
          .setTitle('Uh Oh!')
          .setDescription(`A critical error in the internal code has occured.`)
          .addFields([{ name: 'Error Code', value: `\`${code}\``, inline: true }])
          .setThumbnail('https://icon-library.com/images/image-error-icon/image-error-icon-17.jpg');

        if (guild) {
          embed.addFields([
            { name: 'Guild', value: `\`${guild ? guild.name : 'N/A'}\`` },
            { name: 'Guild ID', value: `\`${guild ? guild.id : 'N/A'}\``, inline: true },
            { name: 'Guild Owner ID', value: `\`${guild ? guild.ownerId : 'N/A'}\``, inline: true }
          ]);
        }

        await dev.send({ embeds: [embed] }).catch(() => { return; });
      }

      console.error('Commander (ERROR) >> Error! Logged to file!'.red);
      console.error(errorObject.errorStack);
      if (quit) process.exit();
    });
  }
}

class CommanderCommand {
  constructor(object, commander) {
    this.commander = commander;
    this.object = object;

    for (const key in object) {
      this[key] = object[key];
    }
  }

  async initialize() {
    if (this.aliases) {
      for (const alias of this.aliases) {
        this.commander.aliases.set(alias, this.name);
      }
    }

    if (this.guilds || this.users) {
      const data = await this.commander.client.database.getAccess(this.name);
      if (data.guilds && this.guilds) this.guilds.push(...data.guilds);
      if (data.users && this.users) this.users.push(...data.users);
      if (this.users) this.users.push(this.commander.client.dev);
    }

    if (this.guilds) {
      for (const guildId of this.guilds) {
        if (!this.commander.client.guilds.cache.has(guildId)) console.warn(`Commander (WARNING) >> Guild (${guildId}) Not Found For Command: ${this.name}`.yellow);

        let guild = this.commander.guilds.get(guildId) || {};
        guild.commands = guild.commands || new Discord.Collection();
        guild.commands.set(this.name, this);

        this.commander.guilds.set(guildId, guild);
      }
    } else {
      this.commander.global.set(this.name, this);
    }

    if (!this.commander.groups.has(this.group)) this.commander.groups.set(this.group, new Discord.Collection());

    this.commander.groups.get(this.group).set(this.name, this);
  }

  getCooldown(guild, user) {
    const now = Date.now();

    if (!this.cooldown) return false;

    let cooldown = this.cooldown * 1000;
    if (!this.commander.cooldowns.has(guild?.id || 'dm')) this.commander.cooldowns.set(guild?.id || 'dm', new Discord.Collection());

    let cooldowns = this.commander.cooldowns.get(guild?.id || 'dm');
    if (!cooldowns.has(user.id)) cooldowns.set(user.id, new Discord.Collection());

    let usages = cooldowns.get(user.id);
    if (usages.has(this.name)) {
      let expire = usages.get(this.name) + cooldown;
      if (now < expire) return ((expire - now) / 1000).toFixed();
    }

    usages.set(this.name, now);

    setTimeout(() => usages.delete(this.name), cooldown);

    return false;
  }
}

class CommanderModule {
  constructor(module, commander) {
    this.commander = commander;
    this.module = module;

    for (const key in module) {
      this[key] = module[key];
    }

    if (this.events) {
      for (const event in this.commander.client._events) {
        if (event == 'error' || event == 'shardDisconnect' || event == 'msgCreate') continue;
        if (this.events.includes(event)) this.client.removeAllListeners(event);
      }
    }

    if (this.guilds) {
      for (const guildId of this.guilds) {
        if (!this.commander.client.guilds.cache.has(guildId)) console.warn(`Commander (WARNING) >> Guild (${guildId}) Not Found For Module: ${this.name}`.yellow);

        let guild = this.commander.guilds.get(guildId) || {};
        guild.modules = guild.modules || new Discord.Collection();
        guild.modules.set(this.name, this);

        this.commander.guilds.set(guildId, guild);
      }
    }
  }

  async initialize(client) {
    try {
      await this.run(client);
      console.log(`Commander >> Loaded ${this.guilds ? 'Guild' : 'Global'} Module: ${this.name}`.brightGreen);
    } catch (err) {
      console.error(`Commander >> Failed to Load ${this.guilds ? 'Guild' : 'Global'} Module: ${this.name}`.red);
      console.error(err);
      Commander.handleError(client, err, false);
    }
  }
}

module.exports = Commander;