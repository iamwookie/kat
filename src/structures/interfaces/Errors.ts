export class NodeError extends Error {
    public constructor(message?: string) {
        super(message);
    }
}

export class PlayerError extends Error {
    public constructor(message?: string) {
        super(message);
    }
}

export class SearchError extends Error {
    public constructor(public code: number, message?: string) {
        super(message);
    }
}
