/**
 * A linked-list for the edges in a @reference[Graph].
 */
export default class EdgeNode {
    /** The node in the Graph this edge connects to */
    y: number;
    /** The weight of this EdgeNode */
	weight: number;
    /** The next EdgeNode in the linked-list */
    next: EdgeNode;

    /**
     * Creates a new EdgeNode
     * @param index The index of the node this edge connects to
     * @param weight The weight of this edge
     */
	constructor(index: number, weight?: number){
		this.y = index;
		this.next = null;
		this.weight = weight ? weight : 1;
	}
}