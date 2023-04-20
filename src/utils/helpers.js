import { YouTubeTrack, SpotifyTrack, YouTubePlaylist, SpotifyPlaylist } from "../structures/index.js";
import { emotes } from "../../config.js";
const musicEmotes = emotes.music;
export function formatDuration(timeInMs) {
    const time = Math.floor(timeInMs / 1000);
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;
    return `${hours > 0 ? hours.toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false }) + ":" : ""}${minutes > 0 ? minutes.toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false }) + ":" : ""}${seconds.toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false })}`;
}
export function formatBytes(bytes) {
    if (!bytes)
        return "No Data";
    let sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes == 0)
        return "0 Byte";
    let i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
}
export function formatUser(user) {
    return {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        tag: user.tag,
        avatarURL: user.avatarURL() ?? undefined,
        bannerURL: user.bannerURL() ?? undefined,
        accentHex: user.hexAccentColor ?? undefined,
    };
}
export function getServiceIcon(item) {
    if (item instanceof YouTubeTrack || item instanceof YouTubePlaylist) {
        return musicEmotes.youtube;
    }
    else if (item instanceof SpotifyTrack || item instanceof SpotifyPlaylist) {
        return musicEmotes.spotify;
    }
    else {
        return "";
    }
}
