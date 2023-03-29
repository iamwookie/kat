import { YouTubeTrack } from "../structures/index.js";
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
    return `${hours > 0 ? hours.toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false }) + ":" : ""}${minutes > 0 ? minutes.toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false }) + ":" : ""}${seconds.toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false })}`;
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
    if (item instanceof YouTubeTrack) {
        return emojis.music.youtube;
    }
    else {
        return "";
    }
}
export function createProgressBar(playbackDuration, totalDuration) {
    playbackDuration = Math.round(playbackDuration / 1000);
    totalDuration = Math.round(totalDuration / 1000);
    let progressBar = stringProgressBar.splitBar(totalDuration, playbackDuration, 26, "▬", emojis.music.slider)[0];
    if (playbackDuration == 0)
        progressBar = emojis.music.slider + progressBar.slice(1);
    return progressBar;
}
