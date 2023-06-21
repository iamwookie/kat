export class NodeError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NodeError';
    }
}
export class PlayerError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PlayerError';
    }
}
