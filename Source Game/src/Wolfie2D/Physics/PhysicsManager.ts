import GameNode from "../Nodes/GameNode";
import Updateable from "../DataTypes/Interfaces/Updateable";
import Tilemap from "../Nodes/Tilemap";
import Receiver from "../Events/Receiver";
import Emitter from "../Events/Emitter";
import Map from "../DataTypes/Map";

/**
 * An abstract physics manager.
 * This class exposes functions for subclasses to implement that should allow for a working physics system to be created.
 */
export default abstract class PhysicsManager implements Updateable {
	/** The event receiver for the physics system */
	protected receiver: Receiver;
	/** The event emitter for the physics system */
	protected emitter: Emitter;

	/** Maps layer names to numbers */
	protected layerMap: Map<number>;

	/** Maps layer numbers to names */
	protected layerNames: Array<string>;

	constructor(){
		this.receiver = new Receiver();
		this.emitter = new Emitter();

		// The creation and implementation of layers is deferred to the subclass
		this.layerMap = new Map();
		this.layerNames = new Array();
	}

	/**
	 * Registers a gamenode with this physics manager
	 * @param object The object to register
	 */
	abstract registerObject(object: GameNode): void;

	/**
	 * Registers a tilemap with this physics manager
	 * @param tilemap The tilemap to register
	 */
	abstract registerTilemap(tilemap: Tilemap): void;

	abstract update(deltaT: number): void;

	/**
	 * Sets the physics layer of the GameNode
	 * @param node The GameNode
	 * @param layer The layer that the GameNode should be on
	 */
	setLayer(node: GameNode, layer: string): void {
		node.physicsLayer = this.layerMap.get(layer);
	}
}