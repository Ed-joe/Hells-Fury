import GameNode from "./GameNode";
import Vec2 from "../DataTypes/Vec2";
import Region from "../DataTypes/Interfaces/Region";
import AABB from "../DataTypes/Shapes/AABB";
import Debug from "../Debug/Debug";
import Color from "../Utils/Color";

/**
 * The representation of an object in the game world that can be drawn to the screen
 */
export default abstract class CanvasNode extends GameNode implements Region {
	private _size: Vec2;
	private _scale: Vec2;
	private _boundary: AABB;
	private _hasCustomShader: boolean;
	private _customShaderKey: string;
	private _alpha: number;

	/** A flag for whether or not the CanvasNode is visible */
	visible: boolean = true;
	
	constructor(){
		super();
		this._size = new Vec2(0, 0);
		this._size.setOnChange(() => this.sizeChanged());
		this._scale = new Vec2(1, 1);
		this._scale.setOnChange(() => this.scaleChanged());
		this._boundary = new AABB();
		this.updateBoundary();

		this._hasCustomShader = false;
	}

	get alpha(): number {
		return this._alpha;
	}

	set alpha(a: number) {
		this._alpha = a;
	}

	get size(): Vec2 {
		return this._size;
	}

	set size(size: Vec2){
		this._size = size;
		// Enter as a lambda to bind "this"
		this._size.setOnChange(() => this.sizeChanged());
		this.sizeChanged();
	}

	get scale(): Vec2 {
		return this._scale;
	}

	set scale(scale: Vec2){
		this._scale = scale;
		// Enter as a lambda to bind "this"
		this._scale.setOnChange(() => this.scaleChanged());
		this.scaleChanged();
	}

	set scaleX(value: number) {
		this.scale.x = value;
	}

	set scaleY(value: number) {
		this.scale.y = value;
	}

	get hasCustomShader(): boolean {
		return this._hasCustomShader;
	}

	get customShaderKey(): string {
		return this._customShaderKey;
	}

	// @override
	protected positionChanged(): void {
		super.positionChanged();
		this.updateBoundary();
	}

	/** Called if the size vector is changed or replaced. */
	protected sizeChanged(): void {
		this.updateBoundary();
	}

	/** Called if the scale vector is changed or replaced */
	protected scaleChanged(): void {
		this.updateBoundary();
	}

	// @docIgnore
	/** Called if the position, size, or scale of the CanvasNode is changed. Updates the boundary. */
	private updateBoundary(): void {
		this._boundary.center.set(this.position.x, this.position.y);
		this._boundary.halfSize.set(this.size.x*this.scale.x/2, this.size.y*this.scale.y/2);
	}

	get boundary(): AABB {
		return this._boundary;
	}

	get sizeWithZoom(): Vec2 {
		let zoom = this.scene.getViewScale();

		return this.boundary.halfSize.clone().scaled(zoom, zoom);
	}

	/**
	 * Adds a custom shader to this CanvasNode
	 * @param key The registry key of the ShaderType
	 */
	useCustomShader(key: string): void {
		this._hasCustomShader = true;
		this._customShaderKey = key;
	}

	/**
	 * Returns true if the point (x, y) is inside of this canvas object
	 * @param x The x position of the point
	 * @param y The y position of the point
	 * @returns A flag representing whether or not this node contains the point.
	 */
	contains(x: number, y: number): boolean {
		return this._boundary.containsPoint(new Vec2(x, y));
	}

	// @implemented
	debugRender(): void {
		Debug.drawBox(this.relativePosition, this.sizeWithZoom, false, Color.BLUE);
		super.debugRender();
	}
}