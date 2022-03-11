import Matrix from './Matrix';
import Vector from './Vector';
import Node from './Node';

interface Heuristic { 
    (position : Vector, destination : Vector): number; 
}

function getLower(openList : Array<Node>) : Node {
    let lower = openList[openList.length-1];

    for (let i = openList.length-2; i >= 0; i--) {
        const node = openList[i];
        if (node.isLower(lower)) {
            lower = node;
        }
    }

    return lower;
}

function generateAdjacent(blocks : Matrix<boolean>, nodes : Matrix<Node>, openList : Array<Node>, destination : Vector, parent : Node, heuristic : Heuristic) : void {
    const check = function(x : number, y : number, z : number) {
        let position : Vector = new Vector(x, y, z);
        if (!blocks.exists(position)) {
            let node = nodes.at(position);
            if (!node) {
                let node : Node = new Node(position, heuristic(position, destination));
                node.setParent(parent);
                nodes.add(position, node);
                openList.push(node);
            }
            else if (node.isOpen() && node.isBetter(parent)) {
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

function *find(blocks : Matrix<boolean>, start : Vector, destination : Vector, heuristic : Heuristic) {
    let node : Node | undefined = new Node(start, heuristic(start, destination));
    let nodes : Matrix<Node> = new Matrix<Node>();
    let openList : Array<Node> = new Array<Node>();

    nodes.add(node.position, node);
    openList.push(node);

    while (openList.length > 0) {
        node = getLower(openList);
        node.close();

        if (Vector.Equals(node.position, destination)) {
            yield node;
        }

        openList = openList.filter((n : Node) => n.isOpen());

        generateAdjacent(blocks, nodes, openList, destination, node, heuristic);

        yield;
    }
}

export default (blocks : Matrix<boolean>, start: Vector, destination : Vector) : Array<Vector> | undefined => {
    const distance = Vector.Distance(start, destination);
    const heuristic : Heuristic = (pos : Vector, dest : Vector) => Vector.Distance(pos, dest) * distance;

    const startToDestination = find(blocks, start, destination, heuristic);
    const destinationToStart = find(blocks, destination, start, heuristic);    

    let std, dts
    do {
        std = startToDestination.next();
        if (std.value) return std.value.getPath();
        dts = destinationToStart.next();
        if (dts.value) return dts.value.getReversePath();
    }
    while (!std.done && !dts.done);
}