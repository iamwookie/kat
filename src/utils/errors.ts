export class NodeError extends Error {
    public constructor(message?: string) {
        super(message);

        this.name = 'NodeError';
    }
}

export class PlayerError extends Error {
    public constructor(message?: string) {
        super(message);

        this.name = 'PlayerError';
    }
}
