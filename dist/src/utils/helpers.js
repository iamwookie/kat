import { YouTubeTrack, SpotifyTrack } from "../structures/music/Track.js";
import { YouTubePlayList, SpotifyPlaylist, SpotifyAlbum } from "play-dl";
import stringProgressBar from "string-progressbar";
import emojis from "./emojis.json" assert { type: "json" };
export function formatTime(time) {
    if (!time)
        return "No Data";
    let seconds = time / 1000;
    const hours = seconds / 3600;
    seconds = seconds % 3600;
    const minutes = seconds / 60;
    seconds = seconds % 60;
    return hours + ":" + minutes + ":" + seconds;
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
export function formatDuration(time) {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;
    return `${hours > 0 ? hours + ":" : ""}${minutes > 0 ? minutes + ":" : ""}${seconds}`;
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
    if (item instanceof YouTubeTrack || item instanceof YouTubePlayList) {
        return emojis.music.youtube;
    }
    else if (item instanceof SpotifyTrack || item instanceof SpotifyPlaylist || item instanceof SpotifyAlbum) {
        return emojis.music.spotify;
    }
    else {
        return '';
    }
}
export function createProgressBar(playbackDuration, totalDuration) {
    const duration = Math.round(playbackDuration / 1000);
    let progressBar = stringProgressBar.splitBar(totalDuration, duration, 26, "▬", emojis.music.slider)[0];
    if (duration == 0)
        progressBar = emojis.music.slider + progressBar.slice(1);
    return progressBar;
}
