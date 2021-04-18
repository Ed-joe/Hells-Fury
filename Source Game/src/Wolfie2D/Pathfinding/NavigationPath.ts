import Stack from "../DataTypes/Stack";
import Vec2 from "../DataTypes/Vec2";
import GameNode from "../Nodes/GameNode";

/**
 * A path that AIs can follow. Uses finishMove() in Physical to determine progress on the route
 */
export default class NavigationPath {
	/** The navigation path, stored as a stack of next positions */
	protected path: Stack<Vec2>;
	/** The current direction of movement */
	protected currentMoveDirection: Vec2;
	/** The distance a node must be to a point to consider it as having arrived */
	protected distanceThreshold: number;

	/**
	 * Constructs a new NavigationPath
	 * @param path The path of nodes to take
	 */
	constructor(path: Stack<Vec2>){
		this.path = path;
		this.currentMoveDirection = Vec2.ZERO;
		this.distanceThreshold = 4;
	}

	/**
	 * Returns the status of navigation along this NavigationPath
	 * @returns True if the node has reached the end of the path, false otherwise
	 */
	isDone(): boolean {
		return this.path.isEmpty();
	}

	/**
	 * Gets the movement direction in the current position along the path
	 * @param node The node to move along the path
	 * @returns The movement direction as a Vec2
	 */
	getMoveDirection(node: GameNode): Vec2 {
		// Return direction to next point in the nav
		return node.position.dirTo(this.path.peek());
	}

	/**
	 * Updates this NavigationPath to the current state of the GameNode
	 * @param node The node moving along the path
	 */
	handlePathProgress(node: GameNode): void {
		if(node.position.distanceSqTo(this.path.peek()) < this.distanceThreshold*this.distanceThreshold){
			// We've reached our node, move on to the next destination
			this.path.pop();
		}
	}

	toString(): string {
		return this.path.toString()
	}
}