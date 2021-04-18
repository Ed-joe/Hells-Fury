import Vec2 from "../DataTypes/Vec2";
import Receiver from "../Events/Receiver";
import Emitter from "../Events/Emitter";
import Scene from "../Scene/Scene";
import Layer from "../Scene/Layer";
import AI from "../DataTypes/Interfaces/AI";
import Physical from "../DataTypes/Interfaces/Physical";
import Positioned from "../DataTypes/Interfaces/Positioned";
import { isRegion } from "../DataTypes/Interfaces/Region";
import Unique from "../DataTypes/Interfaces/Unique";
import Updateable from "../DataTypes/Interfaces/Updateable";
import DebugRenderable from "../DataTypes/Interfaces/DebugRenderable";
import Actor from "../DataTypes/Interfaces/Actor";
import Shape from "../DataTypes/Shapes/Shape";
import AABB from "../DataTypes/Shapes/AABB";
import NavigationPath from "../Pathfinding/NavigationPath";
import TweenController from "../Rendering/Animations/TweenController";
import Debug from "../Debug/Debug";
import Color from "../Utils/Color";
import Circle from "../DataTypes/Shapes/Circle";

/**
 * The representation of an object in the game world.
 * To construct GameNodes, see the @reference[Scene] documentation.
 */
export default abstract class GameNode implements Positioned, Unique, Updateable, Physical, Actor, DebugRenderable {
	/*---------- POSITIONED ----------*/
	private _position: Vec2;

	/*---------- UNIQUE ----------*/
	private _id: number;

	/*---------- PHYSICAL ----------*/
	hasPhysics: boolean = false;
	moving: boolean = false;
	frozen: boolean = false;
	onGround: boolean = false;
	onWall: boolean = false;
	onCeiling: boolean = false;
	active: boolean = false;
	collisionShape: Shape;
	colliderOffset: Vec2;
	isStatic: boolean;
	isCollidable: boolean;
	isTrigger: boolean;
	triggerMask: number;
	triggerEnters: Array<string>;
	triggerExits: Array<string>;
	_velocity: Vec2;
	sweptRect: AABB;
	collidedWithTilemap: boolean;
	group: number;
	isPlayer: boolean;
	isColliding: boolean = false;

	/*---------- ACTOR ----------*/
	_ai: AI;
	aiActive: boolean;
	path: NavigationPath;
	pathfinding: boolean = false;

	/*---------- GENERAL ----------*/
	/** An event receiver. */
	protected receiver: Receiver;
	/** An event emitter. */
	protected emitter: Emitter;
	/** A reference to the scene this GameNode is a part of. */
	protected scene: Scene;
	/** The visual layer this GameNode resides in. */
	protected layer: Layer;
	/** A utility that allows the use of tweens on this GameNode */
	tweens: TweenController;
	/** A tweenable property for rotation. Does not affect the bounding box of this GameNode - Only rendering. */
	rotation: number;
	/** The opacity value of this GameNode */
	abstract set alpha(a: number);

	abstract get alpha(): number;

	// Constructor docs are ignored, as the user should NOT create new GameNodes with a raw constructor
	constructor(){
		this._position = new Vec2(0, 0);
		this._position.setOnChange(() => this.positionChanged());
		this.receiver = new Receiver();
		this.emitter = new Emitter();
		this.tweens = new TweenController(this);
		this.rotation = 0;
	}

	destroy(){
		this.tweens.destroy();
		this.receiver.destroy();

		if(this.hasPhysics){
			this.removePhysics();
		}

		if(this._ai){
			this._ai.destroy();
			delete this._ai;
			this.scene.getAIManager().removeActor(this);
		}

		this.scene.remove(this);

		this.layer.removeNode(this);
	}

	/*---------- POSITIONED ----------*/
	get position(): Vec2 {
		return this._position;
	}

	set position(pos: Vec2) {
		this._position = pos;
		this._position.setOnChange(() => this.positionChanged());
		this.positionChanged();
	}

	get relativePosition(): Vec2 {
		return this.inRelativeCoordinates(this.position);
	}

	/**
	 * Converts a point to coordinates relative to the zoom and origin of this node
	 * @param point The point to conver
	 * @returns A new Vec2 representing the point in relative coordinates
	 */
	inRelativeCoordinates(point: Vec2): Vec2 {
		let origin = this.scene.getViewTranslation(this);
		let zoom = this.scene.getViewScale();
		return point.clone().sub(origin).scale(zoom);
	}

	/*---------- UNIQUE ----------*/
	get id(): number {
		return this._id;
	}

	set id(id: number) {
		// id can only be set once
		if(this._id === undefined){
			this._id = id;
		} else {
			throw "Attempted to assign id to object that already has id."
		}
	}

	/*---------- PHYSICAL ----------*/
	// @implemented
	/**
     * @param velocity The velocity with which to move the object.
     */
	move(velocity: Vec2): void {
		if(this.frozen) return;
		this.moving = true;
		this._velocity = velocity;
	};

	moveOnPath(speed: number, path: NavigationPath): void {
		if(this.frozen) return;
		this.path = path;
		let dir = path.getMoveDirection(this);
		this.moving = true;
		this.pathfinding = true;
		this._velocity = dir.scale(speed);
	}

	// @implemented
    /**
     * @param velocity The velocity with which the object will move.
     */
	finishMove(): void {
		this.moving = false;
		this.position.add(this._velocity);
		if(this.pathfinding){
			this.path.handlePathProgress(this);
			this.path = null;
			this.pathfinding = false;
		}
	}

	// @implemented
	/**
	 * @param collisionShape The collider for this object. If this has a region (implements Region),
	 * it will be used when no collision shape is specified (or if collision shape is null).
	 * @param isCollidable Whether this is collidable or not. True by default.
	 * @param isStatic Whether this is static or not. False by default
	 */
	addPhysics(collisionShape?: Shape, colliderOffset?: Vec2, isCollidable: boolean = true, isStatic: boolean = false): void {
		// Initialize the physics variables
		this.hasPhysics = true;
		this.moving = false;
		this.onGround = false;
		this.onWall = false;
		this.onCeiling = false;
		this.active = true;
		this.isCollidable = isCollidable;
		this.isStatic = isStatic;
		this.isTrigger = false;
		this.triggerMask = 0;
		this.triggerEnters = new Array(32);
		this.triggerExits = new Array(32);
		this._velocity = Vec2.ZERO;
		this.sweptRect = new AABB();
		this.collidedWithTilemap = false;
		this.group = -1;					// The default group, collides with everything

		// Set the collision shape if provided, or simply use the the region if there is one.
		if(collisionShape){
			this.collisionShape = collisionShape;
			this.collisionShape.center = this.position;
		} else if (isRegion(this)) {
			// If the gamenode has a region and no other is specified, use that
			this.collisionShape = (<any>this).boundary.clone();
		} else {
			throw "No collision shape specified for physics object."
		}

		// If we were provided with a collider offset, set it. Otherwise there is no offset, so use the zero vector
		if(colliderOffset){
			this.colliderOffset = colliderOffset;
		} else {
			this.colliderOffset = Vec2.ZERO;
		}

		// Initialize the swept rect
		this.sweptRect = this.collisionShape.getBoundingRect();

		// Register the object with physics
		this.scene.getPhysicsManager().registerObject(this);
	}

	/** Removes this object from the physics system */
    removePhysics(): void {
		// Remove this from the physics manager
		this.scene.getPhysicsManager().deregisterObject(this);

		// Nullify all physics fields
		this.hasPhysics = false;
		this.moving = false;
		this.onGround = false;
		this.onWall = false;
		this.onCeiling = false;
		this.active = false;
		this.isCollidable = false;
		this.isStatic = false;
		this.isTrigger = false;
		this.triggerMask = 0;
		this.triggerEnters = null;
		this.triggerExits = null;
		this._velocity = Vec2.ZERO;
		this.sweptRect = null;
		this.collidedWithTilemap = false;
		this.group = -1;
		this.collisionShape = null;
		this.colliderOffset = Vec2.ZERO;
		this.sweptRect = null;
	}

	/** Disables physics movement for this node */
	freeze(): void {
		this.frozen = true;
	}

	/** Reenables physics movement for this node */
	unfreeze(): void {
		this.frozen = false;
	}

    /** Prevents this object from participating in all collisions and triggers. It can still move. */
    disablePhysics(): void {
		this.active = false;
	}

    /** Enables this object to participate in collisions and triggers. This is only necessary if disablePhysics was called */
    enablePhysics(): void {
		this.active = true;
	}

	/**
	 * Sets the collider for this GameNode
	 * @param collider The new collider to use
	 */
	setCollisionShape(collider: Shape): void {
		this.collisionShape = collider;
		this.collisionShape.center.copy(this.position);
	}

	// @implemented
	/**
     * Sets this object to be a trigger for a specific group
     * @param group The name of the group that activates the trigger
     * @param onEnter The name of the event to send when this trigger is activated
     * @param onExit The name of the event to send when this trigger stops being activated
     */
    setTrigger(group: string, onEnter: string, onExit: string): void {
		// Make this object a trigger
		this.isTrigger = true;

		// Get the number of the physics layer
		let layerNumber = this.scene.getPhysicsManager().getGroupNumber(group);

		if(layerNumber === 0){
			console.warn(`Trigger for GameNode ${this.id} not set - group "${group}" was not recognized by the physics manager.`);
			return;
		}

		// Add this to the trigger mask
		this.triggerMask |= layerNumber;

		// Layer numbers are bits, so get which bit it is
		let index = Math.log2(layerNumber);

		// Set the event names
		this.triggerEnters[index] = onEnter;
		this.triggerExits[index] = onExit;
	};

	// @implemented
	/**
	 * @param group The physics group this node should belong to
	 */
	setGroup(group: string): void {
		this.scene.getPhysicsManager().setGroup(this, group);
	}

	// @implemened
	getLastVelocity(): Vec2 {
		return this._velocity;
	}

	/*---------- ACTOR ----------*/
	get ai(): AI {
		return this._ai;
	}

	set ai(ai: AI) {
		if(!this._ai){
			// If we haven't been previously had an ai, register us with the ai manager
			this.scene.getAIManager().registerActor(this);
		}

		this._ai = ai;
		this.aiActive = true;
	}

	// @implemented
	addAI<T extends AI>(ai: string | (new () => T), options?: Record<string, any>): void {
		if(!this._ai){
			this.scene.getAIManager().registerActor(this);
		}

		if(typeof ai === "string"){
			this._ai = this.scene.getAIManager().generateAI(ai);
		} else {
			this._ai = new ai();
		}

		this._ai.initializeAI(this, options);

		this.aiActive = true;
	}

	// @implemented
	setAIActive(active: boolean, options: Record<string, any>): void {
		this.aiActive = active;
		if(this.aiActive){
			this.ai.activate(options);
		}
	}

	/*---------- TWEENABLE PROPERTIES ----------*/
	set positionX(value: number) {
		this.position.x = value;
	}

	set positionY(value: number) {
		this.position.y = value;
	}

	abstract set scaleX(value: number);

	abstract set scaleY(value: number);

	/*---------- GAME NODE ----------*/
	/**
	 * Sets the scene for this object.
	 * @param scene The scene this object belongs to.
	 */
	setScene(scene: Scene): void {
		this.scene = scene;
	}

	/**
	 * Gets the scene this object is in. 
	 * @returns The scene this object belongs to
	*/
	getScene(): Scene {
		return this.scene;
	}

	/**
	 * Sets the layer of this object.
	 * @param layer The layer this object will be on.
	 */
	setLayer(layer: Layer): void {
		this.layer = layer;
	}

	/**
	 * Returns the layer this object is on.
	 * @returns This layer this object is on.
	*/
	getLayer(): Layer {
		return this.layer;
	}

	/** Called if the position vector is modified or replaced */
	protected positionChanged(): void {
		if(this.collisionShape){
			if(this.colliderOffset){
				this.collisionShape.center = this.position.clone().add(this.colliderOffset);
			} else {
				this.collisionShape.center = this.position.clone();
			}
			
		}
	};

	/**
	 * Updates this GameNode
	 * @param deltaT The timestep of the update.
	 */
	update(deltaT: number): void {
		// Defer event handling to AI.
		while(this.receiver.hasNextEvent()){
			this._ai.handleEvent(this.receiver.getNextEvent());
		}
	}

	// @implemented
	debugRender(): void {
		// Draw the position of this GameNode
		Debug.drawPoint(this.relativePosition, Color.BLUE);

		// If velocity is not zero, draw a vector for it
		if(this._velocity && !this._velocity.isZero()){
			Debug.drawRay(this.relativePosition, this._velocity.clone().scaleTo(20).add(this.relativePosition), Color.BLUE);
		}

		// If this has a collider, draw it
		if(this.collisionShape){
			let color = this.isColliding ? Color.RED : Color.GREEN;

			if(this.isTrigger){
				color = Color.MAGENTA;
			}
			
			color.a = 0.2;

			if(this.collisionShape instanceof AABB){
				Debug.drawBox(this.inRelativeCoordinates(this.collisionShape.center), this.collisionShape.halfSize.scaled(this.scene.getViewScale()), true, color);
			} else if(this.collisionShape instanceof Circle){
				Debug.drawCircle(this.inRelativeCoordinates(this.collisionShape.center), this.collisionShape.hw*this.scene.getViewScale(), true, color);
			}
		}
	}
}

export enum TweenableProperties{
	posX = "positionX",
	posY = "positionY",
	scaleX = "scaleX",
	scaleY = "scaleY",
	rotation = "rotation",
	alpha = "alpha"
}