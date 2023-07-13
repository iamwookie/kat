export enum Events {
    // Subscription
    SubscriptionCreate = 'subscriptionCreate',
    SubscriptionDestroy = 'subscriptionDestroy',
    // Node
    NodeError = 'nodeError',
    NodeReady = 'nodeReady',
    NodeReconnecting = 'nodeReconnecting',
    NodeDisconnect = 'nodeDisconnect',
    NodeClose = 'nodeClose',
    // Track
    TrackException = 'trackException',
    TrackStart = 'trackStart',
    TrackEnd = 'trackEnd',
    TrackAdd = 'trackAdd',
    TrackRemove = 'trackRemove',
    // Player
    PlayerException = 'playerException',
    PlayerUpdate = 'playerUpdate',
    PlayerStart = 'playerStart',
    PlayerEnd = 'playerEnd',
    PlayerResume = 'playerResume',
    PlayerPause = 'playerPause',
    PlayerLoop = 'playerLoop',
}