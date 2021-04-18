/**
 * Represents a game object that can be rendered in Debug mode
 */
export default interface DebugRenderable {
    /** Renders the debugging information for this object. */
    debugRender(): void;
}