import {Schema, model} from 'mongoose'
import Coordinate from '../lib/Coordinate';

export interface Block extends Coordinate {
    x : number,
    y : number,
    z : number,
    updated : Date,
    info : any
}

const integer = {
    type: Number,
    required: true,
    set: (v : number) => Math.floor(v),
}

const blockSchema = new Schema<Block>({
    x: integer,
    y: integer,
    z: integer,
    updated: { type: Date, default: Date.now },
    info: Schema.Types.Mixed
})

blockSchema.index({ x: 1, y: 1, z:1 }, { unique: true });

export const BlockModel = model<Block>("blocks", blockSchema)