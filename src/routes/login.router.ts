import { Router } from 'express';
import login from '../controllers/login.controller';

export default class LoginRouter {

    private router : Router;
    
    constructor() {
        this.router = Router();
        this.router.post('/', login)
    }

    public get Router() {
        return this.router;
    }
}