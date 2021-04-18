import EdgeNode from "./EdgeNode";

export const MAX_V = 100;

/**
 * An implementation of a graph data structure using edge lists. Inspired by The Algorithm Design Manual.
 */
export default class Graph {
	/** An array of edges at the node specified by the index */
	edges: Array<EdgeNode>;
	/** An array representing the degree of the node specified by the index */
	degree: Array<number>;
	/** The number of vertices in the graph */
	numVertices: number;
	/** The number of edges in the graph */
	numEdges: number;
	/** Whether or not the graph is directed */
	directed: boolean;
	/** Whether or not the graph is weighted */
	weighted: boolean;

	/**
	 * Constructs a new graph
	 * @param directed Whether or not this graph is directed
	 */
	constructor(directed: boolean = false){
		this.directed = directed;
		this.weighted = false;

		this.numVertices = 0;
		this.numEdges = 0;

		this.edges = new Array(MAX_V);
		this.degree = new Array(MAX_V);
	}

	/** Adds a node to this graph and returns the index of it
	 * @returns The index of the new node
	*/
	addNode(): number {
		this.numVertices++;
		return this.numVertices;
	}

	/** Adds an edge between node x and y, with an optional weight
	 * @param x The index of the start of the edge
	 * @param y The index of the end of the edge
	 * @param weight The optional weight of the new edge
	*/
	addEdge(x: number, y: number, weight?: number): void {
		let edge = new EdgeNode(y, weight);



		if(this.edges[x]){
			edge.next = this.edges[x];
		}
		
		this.edges[x] = edge;

		if(!this.directed){
			edge = new EdgeNode(x, weight);

			if(this.edges[y]){
				edge.next = this.edges[y];
			}
			
			this.edges[y] = edge;
		}

		this.numEdges += 1;
	}

	/**
	 * Checks whether or not an edge exists between two nodes.
	 * This check is directional if this is a directed graph.
	 * @param x The first node
	 * @param y The second node
	 * @returns true if an edge exists, false otherwise
	 */
	edgeExists(x: number, y: number): boolean {
		let edge = this.edges[x];

		while(edge !== null){
			if(edge.y === y){
				return true;
			}
			edge = edge.next;
		}
	}

	/**
	 * Gets the edge list associated with node x
	 * @param x The index of the node
	 * @returns The head of a linked-list of edges
	 */
	getEdges(x: number): EdgeNode {
		return this.edges[x];
	}

	/**
	 * Gets the degree associated with node x
	 * @param x The index of the node
	 */
	getDegree(x: number): number {
		return this.degree[x];
	}

	/**
	 * Converts the specifed node into a string
	 * @param index The index of the node to convert to a string
	 * @returns The string representation of the node: "Node x"
	 */
	protected nodeToString(index: number): string {
		return "Node " + index;
	}

	/**
	 * Converts the Graph into a string format
	 * @returns The graph as a string
	 */
	toString(): string {
		let retval = "";

		for(let i = 0; i < this.numVertices; i++){
			let edge = this.edges[i];
			let edgeStr = "";
			while(edge !== null){
				edgeStr += edge.y.toString();
				if(this.weighted){
					edgeStr += " (" + edge.weight + ")";
				}
				if(edge.next !== null){
					edgeStr += ", ";
				}

				edge = edge.next;
			}

			retval += this.nodeToString(i) + ": " + edgeStr + "\n";
		}

		return retval;
	}
}