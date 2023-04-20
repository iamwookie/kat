import { KATClient as Client } from '@structures/index.js';
import { Router } from 'express';

export abstract class Route {
    public router: Router;

    abstract register(): Router;

    constructor(
        public client: Client,
        public path: string,
    ) {
        this.router = Router();
    }
}