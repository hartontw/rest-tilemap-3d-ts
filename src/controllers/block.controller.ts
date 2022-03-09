import { BlockModel } from '../models/Block';
import { Request, Response } from 'express';
import ResponseErrror from '../lib/ResponseError';

function wrongCoords(x : any, y : any, z : any) {
    if (isNaN(x)) return true
    if (isNaN(y)) return true
    if (isNaN(z)) return true
}

export default class BlockController {

    public static async post(req : Request, res : Response) {
        try {
            const {x, y, z} = req.body;
            if (wrongCoords(x, y, z)) throw new ResponseErrror(400, 'Coordinates are required');
            if (!req.body.updated) throw new ResponseErrror(400, 'Date is required');
            if (!req.body.info) throw new ResponseErrror(400, 'Info is required');
    
            if (await BlockModel.exists({x,y,z})) throw new ResponseErrror(400, 'Already exists')
    
            const info = req.body.info
            const date = new Date(req.body.updated)
    
            let block = new BlockModel({x, y, z, updated: date, info})
            block = await block.save()
            return res.status(201).json({x:block.x, y:block.y, z:block.z, updated:block.updated, info:block.info});
        }
        catch(error : any) {
            if (error.code) {
                return res.status(error.code).json(error.message)
            }
            console.error(error);
            return res.status(500).json('Something went wrong')
        }
    }

    public static async get(req : Request, res : Response) {
        try {
            const {x, y, z} = req.query;
            if (wrongCoords(x, y, z)) throw new ResponseErrror(400, 'Coordinates are required');

            const block = await BlockModel.findOne({x, y, z}).select(['-_id', '-__v']);

            if (!block) throw new ResponseErrror(404, 'Not found');

            return res.status(200).json(block);
        }
        catch(error : any) {
            if (error.code) {
                return res.status(error.code).json(error.message);
            }
            console.error(error);
            return res.status(500).json('Something went wrong');
        }
    }

    public static async put(req : Request, res : Response) {
        try {
            const {x, y, z} = req.body;
            if (wrongCoords(x, y, z)) throw new ResponseErrror(400, 'Coordinates are required');
            if (!req.body.updated) throw new ResponseErrror(400, 'Date is required');
            
            const info = req.body.info;
            const date = new Date(req.body.updated);

            let block = await BlockModel.findOne({x,y,z}).select(['-_id', '-__v']);
            if (!block) {
                if (!info) return res.status(304).json(block);
                
                block = new BlockModel({x, y, z, updated: date, info});
                block = await block.save();
                return res.status(201).json(block);
            }

            if (date < block.updated) return res.status(304).json(block);

            if (!info) {
                await BlockModel.deleteOne({x, y, z})
                return res.status(200).json()
            }
                
            block.overwrite({x, y, z, updated: date, info})
            block = await block.save()
            return res.status(200).json(block)
        }
        catch(error : any) {
            if (error.code) {
                return res.status(error.code).json(error.message)
            }
            console.error(error);
            return res.status(500).json('Something went wrong')
        }
    }

    public static async patch(req : Request, res : Response) {
        try {
            const {x, y, z} = req.query;
            if (wrongCoords(x, y, z)) throw new ResponseErrror(400, 'Coordinates are required');
            if (!req.body.updated) throw new ResponseErrror(400, 'Date is required');
            if (!req.body.info) throw new ResponseErrror(400, 'Info is required');

            const info = req.body.info
            const date = new Date(req.body.updated)
            
            const stored = await BlockModel.findOneAndUpdate({x, y, z}, {updated: date, info}, {new: true}).select(['-_id', '-__v']);
            if (!stored) throw new ResponseErrror(404, 'Not found')
            return res.status(200).json(stored)
        }
        catch(error : any) {
            if (error.code) {
                return res.status(error.code).json(error.message)
            }
            console.error(error);
            return res.status(500).json('Something went wrong')
        }
    }

    public static async delete(req : Request, res : Response) {
        try {
            const {x, y, z} = req.query;
            if (wrongCoords(x, y, z)) throw new ResponseErrror(400, 'Coordinates are required')

            if (!await BlockModel.exists({x,y,z})) throw new ResponseErrror(404, 'Not found')

            await BlockModel.deleteOne({x, y, z})

            return res.status(200).json()
        }
        catch(error : any) {
            if (error.code) {
                return res.status(error.code).json(error.message)
            }
            console.error(error);
            return res.status(500).json('Something went wrong')
        }
    }
}