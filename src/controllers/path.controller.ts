import { Request, Response } from 'express';
import { Block, BlockModel } from '../models/Block';
import ResponseErrror from '../lib/ResponseError';
import Coordinate from '../lib/Coordinate';
import Vector from '../lib/Vector';
import Matrix from '../lib/Matrix';
import Node from '../lib/Node';

function getLower(openList : Array<Node>) : Node | undefined {
    let l = openList.length-1;
    let lower = openList[l];

    for (let i = openList.length-2; i >= 0; i--) {
        const node = openList[i];
        const nf = node.f;
        const lf = lower.f;
        if (nf < lf || nf == lf && node.h < lower.h) {
            lower = node;
            l = i;
        }
    }

    if (lower) {
        lower.close();
        openList.splice(l, 1);
    }

    return lower;
}

function generateAdjacent(blocks : Matrix<boolean>, nodes : Matrix<Node>, openList : Array<Node>, destination : Vector, parent : Node) : void {
    const check = function(x : number, y : number, z : number) {
        let position : Vector = new Vector(x, y, z);
        if (!blocks.exists(position)) {
            let node = nodes.at(position);
            if (!node) {
                let node : Node = new Node(position, destination);
                node.setParent(parent);
                nodes.add(position, node);
                openList.push(node);
            }
            else if (node.isBetter(parent)) {
                node.setParent(parent);
            }
        }
    }
    check(parent.x-1, parent.y, parent.z);
    check(parent.x+1, parent.y, parent.z);
    check(parent.x, parent.y-1, parent.z);
    check(parent.x, parent.y+1, parent.z);
    check(parent.x, parent.y, parent.z-1);
    check(parent.x, parent.y, parent.z+1);
}

function parse(value : string, header : string) : any | undefined {
    try {
        return JSON.parse(value);
    }
    catch(e : any) {
        throw new ResponseErrror(400, `${header}: ${e.message}`);
    }
}

function vectorize(v : Coordinate) : Vector | undefined {    
    if (v.x === undefined) return;
    if (v.y === undefined) return;
    if (v.z === undefined) return;
    return new Vector(Number(v.x), Number(v.y), Number(v.z));
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

    start = vectorize(start);
    if (!start) throw new ResponseErrror(400, "start must be a coordinate (x, y, z)");

    destination = vectorize(destination);
    if (!destination) throw new ResponseErrror(400, "destination must be a coordinate (x, y, z)");

    if (Vector.Equals(start, destination)) throw new ResponseErrror(400, "start and destination are the same position");

    if (!space) space = {x:0, y:0, z:0}
    else if (!isNaN(Number(space))) space = {x:space, y:space, z:space}
    space = vectorize(space);
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
        blocks.add(block, true);
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

        let parent : Node = new Node(start, destination);
        let nodes : Matrix<Node> = new Matrix<Node>();
        let openList : Array<Node> = new Array<Node>();

        nodes.add(parent.position, parent);
        parent.close();
    
        while (!Vector.Equals(parent.position, destination)) {
            generateAdjacent(blocks, nodes, openList, destination, parent);
    
            const nextParent = getLower(openList);
            if (!nextParent) {
                return res.status(404).json({error: "Invalid path", path: parent.getPath()});
            }
            parent = nextParent;
        }

        const path = parent.getPath();

        return res.status(200).json(path);
    }
    catch(error : any) {
        if (error.code) {
            return res.status(error.code).json(error.message);
        }
        console.error(error);
        return res.status(500).json('Something went wrong');
    }
}