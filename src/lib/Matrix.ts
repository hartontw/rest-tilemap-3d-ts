import Coordinate from "./Coordinate";

export default class Matrix<T> {
    private matrix : Array<Array<Array<T>>>;

    constructor() {
        this.matrix = new Array<Array<Array<T>>>(); 
    }

    public at(pos : Coordinate) : T | undefined {
        if (this.exists(pos)) {
            return this.matrix[pos.x][pos.y][pos.z];
        }
    }

    public exists(pos : Coordinate) : boolean {
        if (!this.matrix[pos.x]) return false;
        if (!this.matrix[pos.x][pos.y]) return false;
        return this.matrix[pos.x][pos.y][pos.z] ? true : false;
    }

    public add(pos : Coordinate, value : T) {        
        if (!this.matrix[pos.x]) this.matrix[pos.x] = new Array<Array<T>>();
        if (!this.matrix[pos.x][pos.y]) this.matrix[pos.x][pos.y] = new Array<T>();
        this.matrix[pos.x][pos.y][pos.z] = value;
    }

    public remove(pos : Coordinate) {
        if (this.exists(pos)) {
            delete this.matrix[pos.x][pos.y][pos.z];
        }
    }
}