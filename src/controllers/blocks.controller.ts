import { Block, BlockModel } from '../models/Block';
import { Request, Response } from 'express';
import { HydratedDocument } from 'mongoose';

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
        const newBlock : HydratedDocument<Block> = new BlockModel(block)
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

async function deleteOne(filter : object) {
    try {
        await BlockModel.deleteOne(filter)
        return true
    }
    catch (error) {
        return false
    }
}

export default class BlocksController {

    static async post(req: Request, res: Response) {
        try {
            if (!(req.body instanceof Array)) return res.status(400).json("Body is not an array of blocks")

            const response = {
                failed: Array<Block>(),
                inserted: Array<Block>(),
                updated: Array<Block>(),
                expired: Array<Block>(),
                deleted: Array<Block>()
            }

            const blocks = req.body.sort((a, b) => b.updated - a.updated)

            for (const block of blocks) {

                if (checkBlock(block)) {
                    const stored = await BlockModel.findOne({ x: block.x, y: block.y, z: block.z })
                    if (stored) {
                        if (block.updated > stored.updated) {
                            if (block.info) {
                                if (await updateOne(stored, block)) response.updated.push(block)
                                else response.failed.push(block)
                            }
                            else {
                                if (await deleteOne(block)) response.deleted.push(block)
                                else response.failed.push(block)
                            }
                        }
                        else response.expired.push(block)
                    }
                    else if (block.info) {
                        if (await newBlock(block)) response.inserted.push(block)
                        else response.failed.push(block)
                    }
                    else response.expired.push(block)
                }
                else response.failed.push(block)
            }

            return res.status(200).json(response)
        }
        catch (error) {
            console.error(error)
            return res.status(500).json('Something went wrong')
        }
    }

    static async get(req: Request, res: Response) {
        let filter = {} // Object
        let sort = {} // Object
        let select = [] // Array
        let limit : number = 0 // Number

        let header;
        try {
            if (req.query.filter) {
                header = "filter"
                filter = JSON.parse(req.query.filter as string)
            }
            if (req.query.sort) {
                header = "sort"
                sort = JSON.parse(req.query.sort as string)
            }
            if (req.query.select) {
                header = "select"
                select = JSON.parse(req.query.select as string)
            }
            if (req.query.limit) {
                limit = Number(req.query.limit) || 0
            }
        }
        catch (error : any) {
            return res.status(400).json(`${header}: ${error.message}`)
        }

        try {
            const blocks = await BlockModel.find(filter).sort(sort).select(select).select(['-_id', '-__v']).limit(limit)
            return res.status(200).json(blocks)
        }
        catch (error) {
            console.error(error)
            return res.status(500).json('Something went wrong')
        }
    }

    static async delete(req: Request, res: Response) {
        let filter = {} // Object

        try {
            if (req.query.filter) {
                filter = JSON.parse(req.query.filter as string)
            }
        }
        catch (error : any) {
            return res.status(400).json(`${error.message}`)
        }

        try {
            await BlockModel.deleteMany(filter)
            return res.status(200).json()
        }
        catch (error) {
            console.error(error)
            return res.status(500).json('Something went wrong')
        }
    }
}