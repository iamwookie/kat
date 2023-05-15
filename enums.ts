export enum PermissionPrompts {
    NotAllowed = 'You do not have enough permissions!',
    CannotSend = 'I can\'t send messages in that channel. Make sure I have the appropriate permissions, or if you don\'t want such errors in the future, give me the `Administrator` permission!',
}

export enum MusicPrompts {
    NoResults = 'Couldn\'t find your search results!',
    NotPlaying = 'I\'m not playing anything!',
    NotInVoice = 'You are not in a voice channel!',
    NotInMyVoice = 'You are not in my voice channel!',
    IncorrectVoice = 'I cannot play in that voice channel!',
    CannotPlayInVoice = 'I can\'t play in that voice channel!',
    VoiceError = 'Error establishing a voice channel connection. Try again in a few minutes!',
    QueueEmpty = 'The current queue is empty!',
    LastTrack = 'This is the last track in the queue!',
    TrackError = 'An error occurred while playing the track. Skipping...',
    NoNodes = 'There are no available nodes to play on!',
    Restarted = 'The bot has restarted, please replay your track!',
}

export enum MusicEmojis {
    YouTube = "<:youtube:1067881972774477844>",
    Spotify = "<:spotify:1067881968697614476>",
}