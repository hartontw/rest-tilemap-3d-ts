import Vector from "./Vector";

export default class Node {
    private _position : Vector;    
    private heuristic : number;
    private parent? : Node;
    private open : boolean;

    constructor (position : Vector, destination : Vector) {
        this._position = position;        
        this.heuristic = Vector.Distance(position, destination);
        this.open = true;
        this.parent = undefined;
    }

    public setParent(parent : Node) {
        this.parent = parent;
    }

    public getPath() {                
        const reversePath : Array<Vector> = new Array<Vector>();

        let parent = this.parent;
        while (parent) {
            reversePath.push(parent.position)
            parent = parent.parent
        }
        
        return reversePath.reverse()
    }

    public isOpen() {
        return this.open;
    }

    public close() {
        this.open = false;
    }

    public isBetter(parent : Node) {
        return this.isOpen() && this.g > parent.g + 1
    }

    public get position() : Vector {
        return this._position;
    }

    public get x() : number {
        return this._position.x;
    }

    public get y() : number {
        return this._position.y;
    }

    public get z() : number {
        return this._position.z
    }

    public get g() : number {
        return this.parent ? this.parent.g + 1 : 0;
    }

    public get h() : number {
        return this.heuristic;
    }

    public get f() : number {
        return this.g + this.h;
    }
}