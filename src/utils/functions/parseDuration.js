function parseDuration(time) {
    let hours = Math.floor(time / 3600);
    let minutes = Math.floor(time / 60);
    let seconds = time - minutes * 60;
    return `${hours > 0 ? hours + ':' : ''}${minutes > 0 ? minutes + ':' : ''}${seconds}`;
};

module.exports = parseDuration;