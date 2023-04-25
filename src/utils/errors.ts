export class NodeError extends Error {
    public name = 'NodeError';

    public constructor(message: string) {
        super(message);
    }
}

export class PlayerError extends Error {
    public name = 'PlayerError';

    public constructor(message: string) {
        super(message);
    }
}
