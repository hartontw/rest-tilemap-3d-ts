export default class Vector {
    public x : number;
    public y : number;
    public z : number;

    constructor(x : number, y : number, z : number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public length() : number {
        return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
    }

    public normalized() : Vector {
        return this.div(this.length());
    }

    public add(o : Vector) : Vector {
        return new Vector(this.x+o.x, this.y+o.y, this.z+o.z);
    }

    public sub(o : Vector) : Vector {
        return new Vector(this.x-o.x, this.y-o.y, this.z-o.z);
    }

    public mul(o : number) : Vector {
        return new Vector(this.x*o, this.y*o, this.z*o);
    }

    public div(o : number) : Vector {
        return new Vector(this.x/o, this.y/o, this.z/o);
    }

    public ['+'](o : Vector) : Vector { return this.add(o); }
    public ['-'](o : Vector) : Vector { return this.sub(o); }
    public ['*'](o : number) : Vector { return this.mul(o); }
    public ['/'](o : number) : Vector { return this.div(o); }

    public read(key : string)  : number | undefined {
        if (key === 'x') return this.x;
        if (key === 'y') return this.y;
        if (key === 'z') return this.z;
    }

    public write(key : string, value : number) : void {
        if (key === 'x') this.x = value;
        if (key === 'y') this.y = value;
        if (key === 'z') this.z = value;
    }

    static Equals(a : Vector, b : Vector) : boolean {
        return a.x === b.x && a.y === b.y && a.z === b.z;
    }

    static Distance(a : Vector, b : Vector) : number {
        return Math.abs(a.x-b.x) + Math.abs(a.y-b.y) + Math.abs(a.z-b.z);
    }

    static Direction(from : Vector, to : Vector) : Vector {
        return new Vector(to.x-from.x, to.y-from.y, to.z-from.z);
    }

    static NormalizeInt(v : Vector) : Vector {
        if (v.x === 0 && v.y === 0 && v.z === 0) return Vector.Zero;

        const ax = Math.abs(v.x);
        const ay = Math.abs(v.y);
        const az = Math.abs(v.z);

        if (ax > ay && ax > az) return new Vector(Math.sign(ax), 0, 0);
        if (ay > az) return new Vector(0, Math.sign(v.y), 0);
        return new Vector(0, 0, Math.sign(v.z));
    }

    static Parse(obj : any) : Vector | undefined {
        if (isNaN(obj.x)) return;
        if (isNaN(obj.y)) return;
        if (isNaN(obj.z)) return;
        return new Vector(Number(obj.x), Number(obj.y), Number(obj.z));
    }

    static get Zero() : Vector { return new Vector(0, 0, 0); }
    static get One() : Vector { return new Vector(1, 1, 1); }
    static get Right() : Vector { return new Vector(1, 0, 0); }
    static get Left() : Vector { return new Vector(-1, 0, 0); }
    static get Up() : Vector { return new Vector(0, 1, 0); }
    static get Down() : Vector { return new Vector(0, -1, 0); }
    static get Forward() : Vector { return new Vector(0, 0, 1); }
    static get Back() : Vector { return new Vector(0, 0, -1); }
}