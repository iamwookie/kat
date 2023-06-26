export class NodeError extends Error {
    constructor(message) {
        super(message);
    }
}
export class PlayerError extends Error {
    constructor(message) {
        super(message);
    }
}
export class SearchError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
