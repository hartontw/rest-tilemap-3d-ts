import Vector from "./Vector";

export default class Matrix<T> {
    private matrix : Array<Array<Array<T>>>;
    private elements : number;

    constructor() {
        this.matrix = new Array<Array<Array<T>>>(); 
        this.elements = 0;
    }

    public get count() {
        return this.elements;
    }

    public at(pos : Vector) : T | undefined {
        if (this.exists(pos)) {
            return this.matrix[pos.x][pos.y][pos.z];
        }
    }

    public exists(pos : Vector) : boolean {
        if (!this.matrix[pos.x]) return false;
        if (!this.matrix[pos.x][pos.y]) return false;
        return this.matrix[pos.x][pos.y][pos.z] ? true : false;
    }

    public add(pos : Vector, value : T) {        
        if (!this.matrix[pos.x]) this.matrix[pos.x] = new Array<Array<T>>();
        if (!this.matrix[pos.x][pos.y]) this.matrix[pos.x][pos.y] = new Array<T>();
        this.matrix[pos.x][pos.y][pos.z] = value;
        this.elements++;
    }

    public remove(pos : Vector) {
        if (this.exists(pos)) {
            delete this.matrix[pos.x][pos.y][pos.z];
            this.elements--;
        }
    }
}