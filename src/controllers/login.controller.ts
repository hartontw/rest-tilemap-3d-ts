import jwt from 'jsonwebtoken';
import { RC4 } from '../lib/Crypt';
import { Request, Response } from 'express';

interface Remote {
    count : number,
    date : Date
}

type RemoteMap = { 
    [ip: string]: Remote; 
}

const maxAttempts : number = 3;
const maxRemotes : number = 100;
const timePenalty : number = 300000;
const remotes : RemoteMap = {};

function isBlocked(ip : string) : boolean {
    const remote = remotes[ip];
    if (!remote) return false;
    if (remote.count < maxAttempts) return false;
    return new Date().getTime() - remote.date.getTime() < timePenalty
}

function underAttack() {
    return Object.keys(remotes).length > maxRemotes
}

function addAttempt(ip : string) {
    if (remotes[ip]) {
        remotes[ip].count++;
        remotes[ip].date = new Date()        
    }
    else remotes[ip] = {count: 0, date: new Date()};
}

function deleteRemote(ip : string) {
    if (remotes[ip]) {
        delete remotes[ip]
    }
}

export default async (req : Request, res : Response) => {
    try {    
        if (!process.env.PASSWORD) return res.status(200).json({auth:true})

        if (!req.body.password) return res.status(400).json({auth:false, message:"Password required"})

        if (underAttack()) return res.status(503).json({auth:false, message:"Under attack"})

        const ip : string = <string>req.socket.remoteAddress;       
            
        if (isBlocked(ip)) return res.status(403).json({auth:false, message:"Blocked"})

        const password = req.body.password

        const authorized = process.env.ENCRYPTED ? ip === RC4(process.env.PASSWORD, password) : process.env.PASSWORD === password

        if (!authorized) {
            addAttempt(ip)
            return res.status(401).json({auth:false, message:"Unauthorized"})
        }

        deleteRemote(ip)
    
        const token = jwt.sign({ ip }, <jwt.Secret>process.env.TOKEN_KEY);
        return res.status(200).json({
            auth:true,
            token
        })
    }
    catch(error) {
        console.error(error)
        return res.status(500).json({auth:false, message:"Internal server error"})
    }
}