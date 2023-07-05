!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="dd46a630-0bb6-531f-a565-0704ed8af628")}catch(e){}}();
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
//# debugId=dd46a630-0bb6-531f-a565-0704ed8af628
//# sourceMappingURL=Errors.js.map
