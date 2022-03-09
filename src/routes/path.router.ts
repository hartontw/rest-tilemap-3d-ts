import { Router } from 'express';
import find from '../controllers/path.controller';

export default class PathRouter {

    private router : Router;
    
    constructor() {
        this.router = Router();
        this.router.get('/', find)
    }

    public get Router() {
        return this.router;
    }
}