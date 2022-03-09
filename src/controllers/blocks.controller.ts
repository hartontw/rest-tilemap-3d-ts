import { Block, BlockModel } from '../models/Block';
import { Request, Response } from 'express';
import { HydratedDocument } from 'mongoose';
import ResponseErrror from '../lib/ResponseError';

function checkBlock(block: Block) {
    if (isNaN(block.x)) return false
    if (isNaN(block.y)) return false
    if (isNaN(block.z)) return false
    block.updated = new Date(block.updated)
    if (isNaN(block.updated.valueOf())) return false
    return true
}

async function newBlock(block: Block) {
    try {
        const newBlock: HydratedDocument<Block> = new BlockModel(block)
        return await newBlock.save()
    }
    catch (error) { }
}

async function updateOne(stored: HydratedDocument<Block>, block: Block) {
    try {
        stored.overwrite(block)
        return await stored.save()
    }
    catch (error) { }
}

async function deleteOne(filter: object) {
    try {
        await BlockModel.deleteOne(filter)
        return true
    }
    catch (error) {
        return false
    }
}

function parse(value: string, header: string): any | undefined {
    try {
        return JSON.parse(value);
    }
    catch (e: any) {
        throw new ResponseErrror(400, `${header}: ${e.message}`);
    }
}

function loadQuery(req : Request) {
    return {
        filter: req.query.filter ? parse(<string>req.query.filter, 'filter') : {},
        sort: req.query.sort ? parse(<string>req.query.sort, 'sort') : {},
        select: req.query.select ? parse(<string>req.query.select, 'select') : [],
        limit: req.query.limit ? Number(req.query.limit) : 0
    }
}

export default class BlocksController {

    static async post(req: Request, res: Response) {
        try {
            if (!(req.body instanceof Array)) return res.status(400).json("Body is not an array of blocks");

            const response = {
                failed: Array<Block>(),
                inserted: Array<Block>(),
                updated: Array<Block>(),
                expired: Array<Block>(),
                deleted: Array<Block>()
            };

            const blocks = req.body.sort((a, b) => b.updated - a.updated);

            for (const block of blocks) {

                if (checkBlock(block)) {
                    const stored = await BlockModel.findOne({ x: block.x, y: block.y, z: block.z });
                    if (stored) {
                        if (block.updated > stored.updated) {
                            if (block.info) {
                                if (await updateOne(stored, block)) response.updated.push(block);
                                else response.failed.push(block);
                            }
                            else {
                                if (await deleteOne(block)) response.deleted.push(block);
                                else response.failed.push(block);
                            }
                        }
                        else response.expired.push(block);
                    }
                    else if (block.info) {
                        if (await newBlock(block)) response.inserted.push(block);
                        else response.failed.push(block);
                    }
                    else response.expired.push(block);
                }
                else response.failed.push(block);
            }

            return res.status(200).json(response);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json('Something went wrong');
        }
    }

    static async get(req: Request, res: Response) {
        try {
            let {filter, sort, select, limit} = req.body && Object.keys(req.body).length > 0 ? req.body : loadQuery(req);    

            if (!filter) filter = {};
            if (!sort) sort = {};
            if (!select) select = [];
            if (!limit) limit = 0;            

            const sub = select.some((s: string) => s[0] === '-');
            const add = select.some((s: string) => s[0] !== '-');
            if (add && sub) throw new ResponseErrror(400, 'The selection must be inclusive or exclusive');

            select = select.filter((s: any) => s !== '_id' && s !== '__v');
            if (sub || select.length === 0) select.push('-__v');
            if (!select.includes('-_id')) select.push('-_id');

            const blocks = await BlockModel.find(filter).sort(sort).select(select).limit(limit);
            return res.status(200).json(blocks);
        }
        catch (error: any) {
            if (error.code) {
                return res.status(error.code).json(error.message);
            }
            console.error(error);
            return res.status(500).json('Something went wrong');
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const filter = req.query.filter ? parse(<string>req.query.filter, 'filter') : {};
            await BlockModel.deleteMany(filter);
            return res.status(200).json();
        }
        catch (error : any) {
            if (error.code) {
                return res.status(error.code).json(error.message);
            }
            console.error(error);
            return res.status(500).json('Something went wrong');
        }
    }
}