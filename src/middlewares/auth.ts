import {Request, Response, NextFunction} from 'express';
import { verify } from 'jsonwebtoken';

export default (req : Request, res : Response, next : NextFunction) => {
    if (!process.env.PASSWORD) return next();
    if (!process.env.TOKEN_KEY) return res.status(501).json("TOKEN_KEY is required");

    const token : string = req.headers['x-access-token'] as string;
    if (token) {        
        try {
            const TOKEN_KEY : string = process.env.TOKEN_KEY;
            const decoded = verify(token, TOKEN_KEY) as any;
            if (decoded && decoded.ip && req.socket.remoteAddress 
                && decoded.ip === req.socket.remoteAddress) {
                return next();
            }
        }
        catch(error){
            return res.status(500).json({
                auth:false, 
                message: 'Something went wrong'
            });
        }
    }

    return res.status(401).json({
        auth: false,
        message: 'No valid token provided'
    });
}