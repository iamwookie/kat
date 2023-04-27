import { YouTubeTrack, SpotifyTrack, YouTubePlaylist, SpotifyPlaylist } from '../structures/index.js';
import { emotes } from '../../config.js';
const musicEmotes = emotes.music;
export function formatDuration(milliseconds) {
    if (!milliseconds)
        return 'No Data';
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds
            .toString()
            .padStart(2, '0')}`;
    }
    else if (minutes > 0) {
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    else {
        return `${remainingSeconds.toString().padStart(2, '0')}`;
    }
}
export function formatBytes(bytes) {
    if (!bytes)
        return 'No Data';
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0)
        return '0 Byte';
    let i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
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
        return '';
    }
}
