import { YouTubeTrack, SpotifyTrack, YouTubePlaylist, SpotifyPlaylist } from "@src/structures/index.js";
import { User } from "discord.js";
import stringProgressBar from "string-progressbar";

import Config from "@config";
const musicEmotes = Config.bot.emotes.music;

// API

export function formatTime(time?: number): string {
    if (!time) return "No Data";
    let seconds = time / 1000;
    const hours = seconds / 3600;
    seconds = seconds % 3600;
    const minutes = seconds / 60;
    seconds = seconds % 60;
    return hours + ":" + minutes + ":" + seconds;
}

export function formatBytes(bytes?: number): string {
    if (!bytes) return "No Data";
    let sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes == 0) return "0 Byte";
    let i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
}

export function formatUser(user: User): {
    id: string;
    username: string;
    discriminator: string;
    tag: string;
    avatarURL?: string;
    bannerURL?: string;
    accentHex?: string;
} {
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

// Music

export function formatDuration(timeInMs: number) {
    const time = Math.floor(timeInMs / 1000);
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;
    return `${hours > 0 ? hours.toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false }) + ":" : ""}${
        minutes > 0 ? minutes.toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false }) + ":" : ""
    }${seconds.toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false })}`;
}

export function getServiceIcon(item: YouTubeTrack | SpotifyTrack | YouTubePlaylist | SpotifyPlaylist) {
    if (item instanceof YouTubeTrack || item instanceof YouTubePlaylist) {
        return musicEmotes.youtube;
    } else if (item instanceof SpotifyTrack || item instanceof SpotifyPlaylist) {
        return musicEmotes.spotify;
    } else {
        return "";
    }
} 

export function createProgressBar(playbackDuration: number, totalDuration: number): string {
    playbackDuration = Math.round(playbackDuration / 1000);
    totalDuration = Math.round(totalDuration / 1000);

    let progressBar = stringProgressBar.splitBar(totalDuration, playbackDuration, 26, "▬", musicEmotes.slider)[0];
    if (playbackDuration == 0) progressBar = musicEmotes.slider + progressBar.slice(1);
    return progressBar;
}
