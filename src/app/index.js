const express = require('express');
const app = express();
// ------------------------------------
const TwitchManager = require('@core/twitch/twitchmanager');
const { EventSubMiddleware } = require('@twurple/eventsub');
const { server } = require('@root/config.json');

module.exports = async (client) => {
  client.twitch = await TwitchManager.initialize(client);

  const middleware = new EventSubMiddleware({
    apiClient: client.twitch.apiClient,
    hostName: server.hostName,
    pathPrefix: '/twitch',
    secret: process.env.TWITCH_EVENT_SECRET,
    strictHostCheck: true
  });

  await middleware.apply(app);

  app.get('/', (req, res) => {
    console.log(req.ip);
  });

  app.listen(server.port, async () => {
    console.log(`>>> App Initialized On Port: ${server.port}`.brightGreen.bold.underline);
    await client.twitch.registerListeners(middleware);
    console.log('\n');
  });

  return app;
};


