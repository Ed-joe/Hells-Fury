import Shape from "../Shapes/Shape";
import AABB from "../Shapes/AABB";
import Vec2 from "../Vec2";
import Map from "../Map";

/**
 * Describes an object that can opt into physics.
 */
export default interface Physical {
    /** A flag for whether or not this object has initialized game physics. */
    hasPhysics: boolean;

    /** Represents whether the object is moving or not. */
    moving: boolean;

    /** Represent whether the object is frozen from moving or not. */
    frozen: boolean;

    /** Represents whether the object is on the ground or not. */
    onGround: boolean;

    /** Reprsents whether the object is on the wall or not. */
    onWall: boolean;

    /** Reprsents whether the object is on the ceiling or not. */
    onCeiling: boolean;

    /** Represnts whether this object has active physics or not. */
    active: boolean;

    /** The shape of the collider for this physics object. */
    collisionShape: Shape;

    /** The offset of the collision shape from the center of the node */
    colliderOffset: Vec2;

    /** Represents whether this object can move or not. */
    isStatic: boolean;

    /** Represents whether this object is collidable (solid) or not. */
    isCollidable: boolean;

    /** Represnts whether this object is a trigger or not. */
    isTrigger: boolean;

    /** The trigger mask for this node */
    triggerMask: number;

    /** Events to trigger for collision enters. */
    triggerEnters: Array<string>;

    /** Events to trigger for collision exits */
    triggerExits: Array<string>;

    /** A vector that allows velocity to be passed to the physics engine */
    _velocity: Vec2;

    /** The rectangle swept by the movement of this object, if dynamic */
    sweptRect: AABB;

    /** A boolean representing whether or not the node just collided with the tilemap */
    collidedWithTilemap: boolean;

    /** The physics group this node belongs to */
    group: number;

    isPlayer: boolean;

    isColliding: boolean;

    /*---------- FUNCTIONS ----------*/

    /**
     * Tells the physics engine to handle a move by this object.
     * @param velocity The velocity with which to move the object.
     */
    move(velocity: Vec2): void;

    /**
     * The move actually done by the physics engine after collision checks are done.
     * @param velocity The velocity with which the object will move.
     */
    finishMove(): void;
    
    /**
     * Adds physics to this object
     * @param collisionShape The shape of this collider for this object
     * @param isCollidable Whether this object will be able to collide with other objects
     * @param isStatic Whether this object will be static or not
     */
    addPhysics(collisionShape?: Shape, colliderOffset?: Vec2, isCollidable?: boolean, isStatic?: boolean): void;

    /** Removes this object from the physics system */
    removePhysics(): void;

    /** Prevents this object from participating in all collisions and triggers. It can still move. */
    disablePhysics(): void;

    /** Enables this object to participate in collisions and triggers. This is only necessary if disablePhysics was called */
    enablePhysics(): void;

    /**
     * Sets this object to be a trigger for a specific group
     * @param group The name of the group that activates the trigger
     * @param onEnter The name of the event to send when this trigger is activated
     * @param onExit The name of the event to send when this trigger stops being activated
     */
    setTrigger(group: string, onEnter: string, onExit: string): void;
    
    /**
     * Sets the physics group of this node
     * @param group The name of the group
     */
    setGroup(group: string): void;

    /**
     * If used before "move()", it will tell you the velocity of the node after its last movement
     */
    getLastVelocity(): Vec2;
}