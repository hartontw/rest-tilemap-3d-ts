import Coordinate from "./Coordinate";

export default class Vector implements Coordinate {
    public x : number;
    public y : number;
    public z : number;

    constructor(x : number, y : number, z : number) {
        this.x = x
        this.y = y
        this.z = z
    }

    length() : number {
        return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)
    }

    normalized() : Vector {
        const l = this.length()
        return new Vector(this.x/l, this.y/l, this.z/l)
    }

    static Equals(a : Vector, b : Vector) : boolean {
        return a.x === b.x && a.y === b.y && a.z === b.z
    }

    static Distance(a : Vector, b : Vector) : number {
        return Math.abs(a.x-b.x) + Math.abs(a.y-b.y) + Math.abs(a.z-b.z) 
    }

    static Direction(from : Vector, to : Vector) : Vector {
        return new Vector(to.x-from.x, to.y-from.y, to.z-from.z)
    }
}