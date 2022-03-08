import express from 'express';
import morgan from 'morgan';

class Server {

    private app: express.Application;

    constructor() {
        this.app = express();
        this.config();
    }

    config() {
        this.app.set('port', process.env.PORT || 3000);
        this.app.set('host', process.env.HOST || 'localhost');
        this.app.use(morgan('dev'));
    }

    routes() {

    }

    start() {
        const port : number = this.app.get('port');
        const host : string = this.app.get('host');
        this.app.listen(port, host, () => {
            console.log(`🌐 Listening on ${host}:${port}`);
        });
    }
}

const server = new Server();
server.start()