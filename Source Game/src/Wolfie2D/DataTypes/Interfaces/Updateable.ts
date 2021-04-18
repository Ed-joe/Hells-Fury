/** Represents a game object that can be updated */
export default interface Updateable {
    /**
     * Updates this object.
     * @param deltaT The timestep of the update.
     */
    update(deltaT: number): void;
}