import Vector from "./Vector";

export default class Node {
    private _position : Vector;    
    private heuristic : number;
    private parent? : Node;
    private open : boolean;   

    constructor (position : Vector, heuristic : number) {
        this._position = position;
        this.heuristic = heuristic;
        this.open = true;
        this.parent = undefined;
    }

    public setParent(parent : Node) {
        this.parent = parent;
    }

    public getPath() : Array<Vector> {
        return this.getReversePath().reverse();
    }

    public getReversePath() : Array<Vector> {
        const reversePath : Array<Vector> = new Array<Vector>();

        let parent : Node | undefined = this;
        while (parent) {
            reversePath.push(parent.position);
            parent = parent.parent;
        }
        
        return reversePath;
    }

    public isOpen() {
        return this.open;
    }

    public close() {
        this.open = false;
    }

    public isBetter(other : Node) {
        return this.g > other.g + 1;
    }

    public isLower(other : Node) {
        return this.f < other.f || this.f === other.f && this.h < other.h
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