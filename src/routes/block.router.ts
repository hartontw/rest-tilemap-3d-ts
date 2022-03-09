import { Router } from 'express';
import BlockController from '../controllers/block.controller';

export default class BlockRouter {

    private router : Router;
    
    constructor() {
        this.router = Router();
        this.router.post('/', BlockController.post)
        this.router.get('/', BlockController.get)
        this.router.put('/', BlockController.put)
        this.router.patch('/', BlockController.patch)
        this.router.delete('/', BlockController.delete)
    }

    public get Router() {
        return this.router;
    }
}