!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="6f968bc8-1e4b-54b8-940a-3f0f5ebf3a7d")}catch(e){}}();
export var PermissionPrompts;
(function (PermissionPrompts) {
    PermissionPrompts["NotAllowed"] = "You do not have enough permissions!";
    PermissionPrompts["NotEnough"] = "I have insufficient permissions to function in the text channel. Make sure I have the appropriate permissions. If you don't want such errors in the future, give me the following permissions: \n - `Administrator`";
})(PermissionPrompts || (PermissionPrompts = {}));
export var MusicPrompts;
(function (MusicPrompts) {
    MusicPrompts["NoResults"] = "Couldn't find your search results!";
    MusicPrompts["NotPlaying"] = "I'm not playing anything!";
    MusicPrompts["NotInVoice"] = "You are not in a voice channel!";
    MusicPrompts["NotInMyVoice"] = "You are not in my voice channel!";
    MusicPrompts["IncorrectVoice"] = "I cannot play in that voice channel!";
    MusicPrompts["CannotPlayInVoice"] = "I can't play in that voice channel!";
    MusicPrompts["VoiceError"] = "Error establishing a voice channel connection. Try again in a few minutes!";
    MusicPrompts["QueueEmpty"] = "The current queue is empty!";
    MusicPrompts["LastTrack"] = "This is the last track in the queue!";
    MusicPrompts["TrackError"] = "An error occurred while playing the track. Skipping...";
    MusicPrompts["TrackLooped"] = "Looped the current track!";
    MusicPrompts["TrackUnlooped"] = "Unlooped the current track!";
    MusicPrompts["Inactive"] = "I have disconnected due to inactivity!";
    MusicPrompts["NoNodes"] = "There are no available nodes to play on!";
    MusicPrompts["Restarted"] = "The bot has restarted, please replay your track!";
})(MusicPrompts || (MusicPrompts = {}));
export var MusicEmojis;
(function (MusicEmojis) {
    MusicEmojis["YouTube"] = "<:youtube:1067881972774477844>";
    MusicEmojis["Spotify"] = "<:spotify:1067881968697614476>";
})(MusicEmojis || (MusicEmojis = {}));
//# debugId=6f968bc8-1e4b-54b8-940a-3f0f5ebf3a7d
//# sourceMappingURL=Enums.js.map
