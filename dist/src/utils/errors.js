export class NodeError extends Error {
    name = "NodeError";
    constructor(message) {
        super(message);
    }
}
export class PlayerError extends Error {
    name = "PlayerError";
    constructor(message) {
        super(message);
    }
}
