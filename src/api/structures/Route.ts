import { KATClient as Client } from '@src/structures';
import { Router } from 'express';

export abstract class Route {
    public router: Router;

    abstract register(): Router;

    constructor(
        public client: Client,
        public path: string,
    ) {
        this.client = client;
        this.path = path;
        this.router = Router();
    }
}