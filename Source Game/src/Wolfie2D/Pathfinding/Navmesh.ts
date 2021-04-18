import PositionGraph from "../DataTypes/Graphs/PositionGraph";
import Navigable from "../DataTypes/Interfaces/Navigable";
import Stack from "../DataTypes/Stack";
import Vec2 from "../DataTypes/Vec2";
import GraphUtils from "../Utils/GraphUtils";
import NavigationPath from "./NavigationPath";

/**
 * An implementation of a Navmesh. Navmeshes are graphs in the game world along which nodes can move.
 */
export default class Navmesh implements Navigable {
	/** The graph of points in the NavMesh */
	protected graph: PositionGraph;

	/**
	 * Creates a new Navmesh from the points in the speecified graph
	 * @param graph The graph to construct a navmesh from
	 */
	constructor(graph: PositionGraph){
		this.graph = graph;
	}

	// @implemented
	getNavigationPath(fromPosition: Vec2, toPosition: Vec2): NavigationPath {
		let start = this.getClosestNode(fromPosition);
		let end = this.getClosestNode(toPosition);

		let parent = GraphUtils.djikstra(this.graph, start);

		let pathStack = new Stack<Vec2>(this.graph.numVertices);
		
		// Push the final position and the final position in the graph
		pathStack.push(toPosition.clone());
		pathStack.push(this.graph.positions[end]);

		// Add all parents along the path
		let i = end;
		while(parent[i] !== -1){
			pathStack.push(this.graph.positions[parent[i]]);
			i = parent[i];
		}

		return new NavigationPath(pathStack);
	}

	/**
	 * Gets the closest node in this Navmesh to the specified position
	 * @param position The position to query
	 * @returns The index of the closest node in the Navmesh to the position
	 */
	protected getClosestNode(position: Vec2): number {
		let n = this.graph.numVertices;
		let i = 1;
		let index = 0;
		let dist = position.distanceSqTo(this.graph.positions[0]);
		while(i < n){
			let d = position.distanceSqTo(this.graph.positions[i]);
			if(d < dist){
				dist = d;
				index = i;
			}
			i++;
		}

		return index;
	}
}