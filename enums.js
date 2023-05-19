export var PermissionPrompts;
(function (PermissionPrompts) {
    PermissionPrompts["NotAllowed"] = "You do not have enough permissions!";
    PermissionPrompts["CannotSend"] = "I can't send messages in that channel. Make sure I have the appropriate permissions, or if you don't want such errors in the future, give me the `Administrator` permission!";
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
    MusicPrompts["TrackResumed"] = "Resumed the current track!";
    MusicPrompts["TrackPaused"] = "Paused the current track!";
    MusicPrompts["TrackLooped"] = "Looped the current track!";
    MusicPrompts["TrackUnlooped"] = "Unlooped the current track!";
    MusicPrompts["NoNodes"] = "There are no available nodes to play on!";
    MusicPrompts["Restarted"] = "The bot has restarted, please replay your track!";
})(MusicPrompts || (MusicPrompts = {}));
export var MusicEmojis;
(function (MusicEmojis) {
    MusicEmojis["YouTube"] = "<:youtube:1067881972774477844>";
    MusicEmojis["Spotify"] = "<:spotify:1067881968697614476>";
})(MusicEmojis || (MusicEmojis = {}));
