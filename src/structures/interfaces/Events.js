!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="8ee131af-456e-59a6-b03b-42bd5ddcc9fb")}catch(e){}}();
export var Events;
(function (Events) {
    // Subscription
    Events["SubscriptionCreate"] = "subscriptionCreate";
    Events["SubscriptionDestroy"] = "subscriptionDestroy";
    // Node
    Events["NodeError"] = "nodeError";
    Events["NodeReady"] = "nodeReady";
    Events["NodeReconnecting"] = "nodeReconnecting";
    Events["NodeDisconnect"] = "nodeDisconnect";
    Events["NodeClose"] = "nodeClose";
    // Track
    Events["TrackException"] = "trackException";
    Events["TrackStart"] = "trackStart";
    Events["TrackEnd"] = "trackEnd";
    Events["TrackAdd"] = "trackAdd";
    Events["TrackRemove"] = "trackRemove";
    // Player
    Events["PlayerException"] = "playerException";
    Events["PlayerUpdate"] = "playerUpdate";
    Events["PlayerStart"] = "playerStart";
    Events["PlayerEnd"] = "playerEnd";
    Events["PlayerResume"] = "playerResume";
    Events["PlayerPause"] = "playerPause";
    Events["PlayerLoop"] = "playerLoop";
})(Events || (Events = {}));
//# debugId=8ee131af-456e-59a6-b03b-42bd5ddcc9fb
//# sourceMappingURL=Events.js.map
