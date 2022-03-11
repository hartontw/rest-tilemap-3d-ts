import { Request, Response } from 'express';
import { Block, BlockModel } from '../models/Block';
import ResponseErrror from '../lib/ResponseError';
import Vector from '../lib/Vector';
import Matrix from '../lib/Matrix';
import PathFind from '../lib/PathFind';

const SPACE : number = 2;

function parse(value : string, header : string) : any | undefined {
    try {
        return JSON.parse(value);
    }
    catch(e : any) {
        throw new ResponseErrror(400, `${header}: ${e.message}`);
    }
}

function loadQuery(req : Request) : any {
    let start, destination, filter, space;

    if (!req.query.start) throw new ResponseErrror(400, "Start position is required")
    start = parse(<string>req.query.start, 'start');

    if (!req.query.destination) throw new ResponseErrror(400, "Destination position is required");
    destination = parse(<string>req.query.destination, 'destination');

    if (req.query.filter) {
        filter = parse(<string>req.query.filter, 'filter');
    }

    if (req.query.space) {
        if (isNaN(Number(req.query.space))) {
            space = parse(<string>req.query.space, 'space');
        }
        else space = req.query.space;
    }

    return {
        start,
        destination,
        filter,
        space
    };
}

function readRequest(req : Request) : any {
    let {filter, start, destination, space} = req.body && Object.keys(req.body).length > 0 ? req.body : loadQuery(req);    

    start = Vector.Parse(start);
    if (!start) throw new ResponseErrror(400, "start must be a coordinate (x, y, z)");

    destination = Vector.Parse(destination);
    if (!destination) throw new ResponseErrror(400, "destination must be a coordinate (x, y, z)");

    if (Vector.Equals(start, destination)) throw new ResponseErrror(400, "start and destination are the same position");

    if (!space) space = {x:SPACE, y:SPACE, z:SPACE};
    else if (!isNaN(Number(space))) space = {x:space, y:space, z:space};
    space = Vector.Parse(space);
    if (!space) throw new ResponseErrror(400, "space must be a number or an area (x, y, z)");    

    if (!filter) filter = {};

    return {
        filter,
        start,
        destination,
        space
    };
}

async function loadBlocks(filter : any, start : Vector, destination : Vector, space : Vector) : Promise<Matrix<boolean>> {
    const min = {
        x: Math.min(start.x, destination.x) - space.x,
        y: Math.min(start.y, destination.y) - space.y,
        z: Math.min(start.z, destination.z) - space.z
    };    

    const max = {
        x: Math.max(start.x, destination.x) + space.x,
        y: Math.max(start.y, destination.y) + space.y,
        z: Math.max(start.z, destination.z) + space.z
    }

    filter.x = { $gte : min.x, $lte : max.x };
    filter.y = { $gte : min.y, $lte : max.y };
    filter.z = { $gte : min.z, $lte : max.z };

    const stored : Array<Block> = await BlockModel.find(filter).select(["-_id", "x", "y", "z"]);

    const blocks : Matrix<boolean> = new Matrix<boolean>();
    stored.forEach(block => {
        const pos : Vector = new Vector(block.x, block.y, block.z);
        blocks.add(pos, true);
    });

    if (blocks.exists(start)) throw new ResponseErrror(400, "start is occupied");
    if (blocks.exists(destination)) throw new ResponseErrror(400, "destination is occupied");

    for (let i=min.x; i <= max.x; i++) {
        for (let j=min.y; j<=max.y; j++) {
            blocks.add(new Vector(i, j, min.z-1), true);
            blocks.add(new Vector(i, j, max.z+1), true);
        }
    }

    for (let i=min.x; i <= max.x; i++) {
        for (let k=min.z; k<=max.z; k++) {
            blocks.add(new Vector(i, min.y-1, k), true);
            blocks.add(new Vector(i, max.y+1, k), true);
        }
    }

    for (let j=min.y; j <= max.y; j++) {
        for (let k=min.z; k<=max.z; k++) {
            blocks.add(new Vector(min.x-1, j, k), true);
            blocks.add(new Vector(max.x+1, j, k), true);
        }
    }

    return blocks;
}

export default async (req : Request, res : Response) => {
    try {        
        const {filter, start, destination, space} = readRequest(req);

        const blocks : Matrix<boolean> = await loadBlocks(filter, start, destination, space);

        const path = PathFind(blocks, start, destination);

        if (path) return res.status(200).json(path);

        return res.status(404).json("Invalid path");
    }
    catch(error : any) {
        if (error.code) {
            return res.status(error.code).json(error.message);
        }
        console.error(error);
        return res.status(500).json('Something went wrong');
    }
}