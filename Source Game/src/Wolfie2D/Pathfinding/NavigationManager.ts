import Navigable from "../DataTypes/Interfaces/Navigable";
import Map from "../DataTypes/Map";
import Vec2 from "../DataTypes/Vec2";
import NavigationPath from "./NavigationPath";

/**
 * The manager class for navigation.
 * Handles all navigable entities, such and allows them to be accessed by outside systems by requesting a path
 * from one position to another.
 */
export default class NavigationManager {
	/** The list of all navigable entities */
	protected navigableEntities: Map<Navigable>;

	constructor(){
		this.navigableEntities = new Map();
	}

	/**
	 * Adds a navigable entity to the NavigationManager
	 * @param navName The name of the navigable entitry
	 * @param nav The actual Navigable instance
	 */
	addNavigableEntity(navName: string, nav: Navigable): void {
		this.navigableEntities.add(navName, nav);
	}

	/**
	 * Gets a path frome one point to another using a specified Navigable object
	 * @param navName The name of the registered Navigable object
	 * @param fromPosition The starting position of navigation
	 * @param toPosition The ending position of Navigation
	 * @returns A NavigationPath containing the route to take over the Navigable entity to get between the provided positions.
	 */
	getPath(navName: string, fromPosition: Vec2, toPosition: Vec2): NavigationPath {
		let nav = this.navigableEntities.get(navName);
		return nav.getNavigationPath(fromPosition.clone(), toPosition.clone());
	}
}