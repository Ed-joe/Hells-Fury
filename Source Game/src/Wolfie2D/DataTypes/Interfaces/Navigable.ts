import Vec2 from "../Vec2";
import NavigationPath from "../../Pathfinding/NavigationPath";

/** Represents an entity that can be navigated on. */
export default interface Navigable {
    /**
     * Gets a new navigation path based on this Navigable object.
     * @param fromPosition The position to start navigation from.
     * @param toPosition The position to navigate to.
     */
    getNavigationPath(fromPosition: Vec2, toPosition: Vec2): NavigationPath;
}