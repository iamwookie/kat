import { Router } from 'express';
export class Route {
    client;
    path;
    router;
    constructor(client, path) {
        this.client = client;
        this.path = path;
        this.client = client;
        this.path = path;
        this.router = Router();
    }
}
