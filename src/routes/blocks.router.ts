import { Request, Response, Router } from 'express';
import BlocksController from '../controllers/blocks.controller';

export default class BlocksRouter {

    private router : Router;
    
    constructor() {
        this.router = Router();
        this.router.post('/', BlocksController.post)
        this.router.get('/', BlocksController.get)
        this.router.delete('/', BlocksController.delete)
    }

    public get Router() {
        return this.router;
    }
}