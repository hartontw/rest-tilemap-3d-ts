import { config } from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import mongoose from 'mongoose';

import pkg from '../package.json';

import auth from './middlewares/auth';
import LoginRouter from './routes/login.router';
import BlockRouter from './routes/block.router';
import BlocksRouter from './routes/blocks.router';
import PathRouter from './routes/path.router';

class Server {

    private app : express.Application;
    private db : Promise<mongoose.Mongoose>;

    constructor() {
        this.app = express();
        this.db = mongoose.connect(process.env.CONNECTION_STRING || "mongodb://localhost/rest-tilemap-3d-ts");
        this.config();
        this.routes();
    }

    config() {        
        this.app.set('port', process.env.PORT || 3000);
        this.app.set('host', process.env.HOST || 'localhost');
        this.app.use(express.json());
        this.app.use(morgan('dev'));
        this.app.use(helmet());         
        this.app.use(cors());
        this.app.use(compression());
    }

    routes() {
        const login : LoginRouter = new LoginRouter();
        const block : BlockRouter = new BlockRouter();
        const blocks : BlocksRouter = new BlocksRouter();
        const path : PathRouter = new PathRouter();        

        this.app.get('/', (req, res) => {
            res.json({
                name: pkg.name,
                description: pkg.description,
                version: pkg.version,
                author: pkg.author
            })
        })
        
        this.app.use('/login', login.Router);
        this.app.use('/block', auth, block.Router);
        this.app.use('/blocks', auth, blocks.Router);
        this.app.use('/path', auth, path.Router);
    }

    async start() {
        await this.db;
        console.log('💾 Connected to Mongodb')

        const port : number = this.app.get('port');
        const host : string = this.app.get('host');
        this.app.listen()
        this.app.listen(port, host, () => {
            console.log(`🌐 Listening on ${host}:${port}`);
        });
    }
}

config();
const server = new Server();
server.start();