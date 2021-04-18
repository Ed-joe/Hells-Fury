import Graph, { MAX_V } from "./Graph";
import Vec2 from "../Vec2";
import DebugRenderable from "../Interfaces/DebugRenderable";

/**
 * An extension of Graph that has nodes with positions in 2D space.
 * This is a weighted graph (though not inherently directd)
*/
export default class PositionGraph extends Graph implements DebugRenderable {
	/** An array of the positions of the nodes in this graph */
	positions: Array<Vec2>;

	/**
	 * Createes a new PositionGraph
	 * @param directed Whether or not this graph is directed
	 */
	constructor(directed: boolean = false){
		super(directed);
		this.positions = new Array(MAX_V);
	}

	/**
	 * Adds a positioned node to this graph
	 * @param position The position of the node to add
	 * @returns The index of the added node
	 */
	addPositionedNode(position: Vec2): number {
		this.positions[this.numVertices] = position;
		return this.addNode();
	}

	/**
	 * Changes the position of a node.
	 * Automatically adjusts the weights of the graph tied to this node.
	 * As such, be warned that this function has an O(n + m) running time, and use it sparingly.
	 * @param index The index of the node
	 * @param position The new position of the node
	 */
	setNodePosition(index: number, position: Vec2): void {
		this.positions[index] = position;

		// Recalculate all weights associated with this index
		for(let i = 0; i < this.numEdges; i++){

			let edge = this.edges[i];

			while(edge !== null){
				// If this node is on either side of the edge, recalculate weight
				if(i === index || edge.y === index){
					edge.weight = this.positions[i].distanceTo(this.positions[edge.y]);
				}

				edge = edge.next;
			}
		}
	}

	/**
	 * Gets the position of a node
	 * @param index The index of the node
	 * @returns The position of the node
	 */
	getNodePosition(index: number): Vec2 {
		return this.positions[index];
	}

	/**
	 * Adds an edge to this graph between node x and y.
	 * Automatically calculates the weight of the edge as the distance between the nodes.
	 * @param x The beginning of the edge
	 * @param y The end of the edge
	 */
	addEdge(x: number, y: number): void {
		if(!this.positions[x] || !this.positions[y]){
			throw "Can't add edge to un-positioned node!";
		}

		// Weight is the distance between the nodes
		let weight = this.positions[x].distanceTo(this.positions[y]);

		super.addEdge(x, y, weight);
	}

	// @override
	protected nodeToString(index: number): string {
		return "Node " + index + " - " + this.positions[index].toString();
	}

	debugRender = (): void => {
		// for(let point of this.positions){
		// 	ctx.fillRect((point.x - origin.x - 4)*zoom, (point.y - origin.y - 4)*zoom, 8, 8);
		// }
	}
}