import Viewport from "./Viewport";
import CanvasNode from "../Nodes/CanvasNode";
import Map from "../DataTypes/Map";
import Vec2 from "../DataTypes/Vec2";
import Scene from "../Scene/Scene";
import AABB from "../DataTypes/Shapes/AABB";

/**
 * An abstract interface of a SceneGraph.
 * Exposes methods for use by other code, but leaves the implementation up to the subclasses.
 * The SceneGraph manages the positions of all GameNodes, and can easily prune a visible set for rendering.
 */
export default abstract class SceneGraph {
	/**	A reference to the viewport */
	protected viewport: Viewport;
	/**	A map of CanvasNodes in this SceneGraph */
	protected nodeMap: Array<CanvasNode>;
	/** A counter of IDs for nodes in this SceneGraph */
	protected idCounter: number;
	/** A reference to the Scene this SceneGraph belongs to */
	protected scene: Scene;

	/**
	 * Creates a new SceneGraph
	 * @param viewport The viewport
	 * @param scene The Scene this SceneGraph belongs to
	 */
    constructor(viewport: Viewport, scene: Scene){
		this.viewport = viewport;
		this.scene = scene;
		this.nodeMap = new Array();
		this.idCounter = 0;
    }

	/**
	 * Add a node to the SceneGraph
	 * @param node The CanvasNode to add to the SceneGraph
	 * @returns The SceneGraph ID of this newly added CanvasNode
	 */
    addNode(node: CanvasNode): number {
		this.nodeMap[node.id] = node;
		this.addNodeSpecific(node, this.idCounter);
		this.idCounter += 1;
		return this.idCounter - 1;
	};

	/**
	 * An overridable method to add a CanvasNode to the specific data structure of the SceneGraph
	 * @param node The node to add to the data structure
	 * @param id The id of the CanvasNode
	 */
	protected abstract addNodeSpecific(node: CanvasNode, id: number): void;

	/**
	 * Removes a node from the SceneGraph
	 * @param node The node to remove
	 */
    removeNode(node: CanvasNode): void {
		// Find and remove node in O(n)
		this.nodeMap[node.id] = undefined;
		this.removeNodeSpecific(node, node.id);
	};

	/**
	 * The specific implementation of removing a node
	 * @param node The node to remove
	 * @param id The id of the node to remove
	 */
	protected abstract removeNodeSpecific(node: CanvasNode, id: number): void;

	/**
	 * Get a specific node using its id
	 * @param id The id of the CanvasNode to retrieve
	 * @returns The node with this ID
	 */
	getNode(id: number): CanvasNode {
		return this.nodeMap[id];
	}

	/**
	 * Returns the nodes at specific coordinates
	 * @param vecOrX The x-coordinate of the position, or the coordinates in a Vec2
	 * @param y The y-coordinate of the position
	 * @returns An array of nodes found at the position provided
	 */
    getNodesAt(vecOrX: Vec2 | number, y: number = null): Array<CanvasNode> {
		if(vecOrX instanceof Vec2){
			return this.getNodesAtCoords(vecOrX.x, vecOrX.y);
		} else {
			return this.getNodesAtCoords(vecOrX, y);
		}
	}

	/**
	 * Returns the nodes that overlap a specific boundary
	 * @param boundary The region to check
	 * @returns An array of nodes found overlapping the provided boundary
	 */
	abstract getNodesInRegion(boundary: AABB): Array<CanvasNode>;
	
	/**
	 * Returns all nodes in the SceneGraph
	 * @returns An Array containing all nodes in the SceneGraph
	 */
	getAllNodes(): Array<CanvasNode> {
		let arr = new Array<CanvasNode>();
		for(let i = 0; i < this.nodeMap.length; i++){
			if(this.nodeMap[i] !== undefined){
				arr.push(this.nodeMap[i]);
			}
		}
		return arr;
	}

	/**
	 * The specific implementation of getting a node at certain coordinates
	 * @param x The x-coordinates of the node
	 * @param y The y-coordinates of the node
	 */
    protected abstract getNodesAtCoords(x: number, y: number): Array<CanvasNode>;

	abstract update(deltaT: number): void;
	
	abstract render(ctx: CanvasRenderingContext2D): void;

	/**
	 * Gets the visible set of CanvasNodes based on the @reference[Viewport]
	 * @returns An array containing all visible nodes in the SceneGraph
	 */
    abstract getVisibleSet(): Array<CanvasNode>;
}