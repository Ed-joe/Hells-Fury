import Vec2 from "../DataTypes/Vec2";
import GameNode from "../Nodes/GameNode";
import CanvasNode from "../Nodes/CanvasNode";
import MathUtils from "../Utils/MathUtils";
import Queue from "../DataTypes/Queue";
import AABB from "../DataTypes/Shapes/AABB";
import Input from "../Input/Input";
import ParallaxLayer from "../Scene/Layers/ParallaxLayer";
import UILayer from "../Scene/Layers/UILayer";

/**
 * The viewport of the game. Corresponds to the visible window displayed in the browser.
 * The viewport keeps track of its position in the game world, and can act as a camera to follow objects.
 */
export default class Viewport {
    /** The AABB that contains the position and size of the viewport view */
    private view: AABB;
    /** The boundary for the viewport. This represents the limits to where the viewport can go */
    private boundary: AABB;
    /** The GameNode the Viewport is following */
    private following: GameNode;
    /** The position the GameNode is focusing on. This is overridden if "following" is set. */
    private focus: Vec2;

    /** A queue of previous positions of what this viewport is following. Used for smoothing viewport movement */
    private lastPositions: Queue<Vec2>;

    /** The number of previous positions this viewport tracks */
    private smoothingFactor: number;

    /** A boolean tha represents whether the player can zoom by scrolling with the mouse wheel */
    private scrollZoomEnabled: boolean;

    /** The amount that is zoomed in or out. */
    private ZOOM_FACTOR: number = 1.2;

    /** The size of the canvas */
    private canvasSize: Vec2;

    constructor(canvasSize: Vec2, zoomLevel: number){
        this.view = new AABB(Vec2.ZERO, Vec2.ZERO);
        this.boundary = new AABB(Vec2.ZERO, Vec2.ZERO);
        this.lastPositions = new Queue();
        this.smoothingFactor = 10;
        this.scrollZoomEnabled = false;
        this.canvasSize = Vec2.ZERO;
        this.focus = Vec2.ZERO;

        // Set the size of the canvas
        this.setCanvasSize(canvasSize);

        // Set the size of the viewport
        this.setSize(canvasSize);
        this.setZoomLevel(zoomLevel);

        // Set the center (and make the viewport stay there)
        this.setCenter(this.view.halfSize.clone());
        this.setFocus(this.view.halfSize.clone());
    }

    /** Enables the viewport to zoom in and out */
    enableZoom(): void {
        this.scrollZoomEnabled = true;
    }

    /**
     * Returns the position of the viewport
     * @returns The center of the viewport as a Vec2
     */
    getCenter(): Vec2 {
        return this.view.center;
    }

    /**
     * Returns a new Vec2 with the origin of the viewport
     * @returns The top left cornder of the Vieport as a Vec2
     */
    getOrigin(): Vec2 {
        return new Vec2(this.view.left, this.view.top);
    }

    /**
     * Returns the region visible to this viewport
     * @returns The AABB containing the region visible to the viewport
     */
    getView(): AABB {
        return this.view;
    }

    /**
     * Set the position of the viewport
     * @param vecOrX The new position or the x-coordinate of the new position
     * @param y The y-coordinate of the new position
     */
    setCenter(vecOrX: Vec2 | number, y: number = null): void {
        let pos: Vec2;
		if(vecOrX instanceof Vec2){
            pos = vecOrX;
        } else {
            pos = new Vec2(vecOrX, y);
        }

        this.view.center = pos;
    }

    /**
     * Returns the size of the viewport as a Vec2
     * @returns The half-size of the viewport as a Vec2
     */
    getHalfSize(): Vec2 {
        return this.view.getHalfSize();
    }
    
    /**
     * Sets the size of the viewport
     * @param vecOrX The new width of the viewport or the new size as a Vec2
     * @param y The new height of the viewport
     */
    setSize(vecOrX: Vec2 | number, y: number = null): void {
		if(vecOrX instanceof Vec2){
			this.view.setHalfSize(vecOrX.scaled(1/2));
		} else {
			this.view.setHalfSize(new Vec2(vecOrX/2, y/2));
		}
    }

    /**
     * Sets the half-size of the viewport
     * @param vecOrX The new half-width of the viewport or the new half-size as a Vec2
     * @param y The new height of the viewport
     */
    setHalfSize(vecOrX: Vec2 | number, y: number = null): void {
		if(vecOrX instanceof Vec2){
			this.view.setHalfSize(vecOrX.clone());
		} else {
			this.view.setHalfSize(new Vec2(vecOrX, y));
		}
    }

    /**
     * Updates the viewport with the size of the current Canvas
     * @param vecOrX The width of the canvas, or the canvas size as a Vec2
     * @param y The height of the canvas
     */
    setCanvasSize(vecOrX: Vec2 | number, y: number = null): void {
		if(vecOrX instanceof Vec2){
			this.canvasSize = vecOrX.clone();
		} else {
			this.canvasSize = new Vec2(vecOrX, y);
		}
    }

    /**
     * Sets the zoom level of the viewport
     * @param zoom The zoom level
     */
    setZoomLevel(zoom: number): void {
        this.view.halfSize.copy(this.canvasSize.scaled(1/zoom/2));
    }

    /**
     * Gets the zoom level of the viewport
     * @returns The zoom level
     */
    getZoomLevel(): number {
        return this.canvasSize.x/this.view.hw/2
    }

    /**
     * Sets the smoothing factor for the viewport movement.
     * @param smoothingFactor The smoothing factor for the viewport
     */
    setSmoothingFactor(smoothingFactor: number): void {
        if(smoothingFactor < 1) smoothingFactor = 1;
        this.smoothingFactor = smoothingFactor;
    }

    /**
     * Tells the viewport to focus on a point. Overidden by "following".
     * @param focus The point the  viewport should focus on
     */
    setFocus(focus: Vec2): void {
        this.focus.copy(focus);
    }
    
    /**
     * Returns true if the CanvasNode is inside of the viewport
     * @param node The node to check
     * @returns True if the node is currently visible in the viewport, false if not
     */
    includes(node: CanvasNode): boolean {
        let parallax = node.getLayer() instanceof ParallaxLayer || node.getLayer() instanceof UILayer ? (<ParallaxLayer>node.getLayer()).parallax : new Vec2(1, 1);
        let center = this.view.center.clone();
        this.view.center.mult(parallax);
        let overlaps = this.view.overlaps(node.boundary);
        this.view.center = center
        return overlaps;
    }

	// TODO: Put some error handling on this for trying to make the bounds too small for the viewport
    // TODO: This should probably be done automatically, or should consider the aspect ratio or something
    /**
     * Sets the bounds of the viewport
     * @param lowerX The left edge of the viewport
     * @param lowerY The top edge of the viewport
     * @param upperX The right edge of the viewport
     * @param upperY The bottom edge of the viewport
     */
    setBounds(lowerX: number, lowerY: number, upperX: number, upperY: number): void {
        let hwidth = (upperX - lowerX)/2;
        let hheight = (upperY - lowerY)/2;
        let x = lowerX + hwidth;
        let y = lowerY + hheight;
        this.boundary.center.set(x, y);
        this.boundary.halfSize.set(hwidth, hheight);
    }

    /**
     * Make the viewport follow the specified GameNode
     * @param node The GameNode to follow
     */
    follow(node: GameNode): void {
        this.following = node;
    }

    updateView(): void {
        if(this.lastPositions.getSize() > this.smoothingFactor){
            this.lastPositions.dequeue();
        }
        
        // Get the average of the last 10 positions
        let pos = Vec2.ZERO;
        this.lastPositions.forEach(position => pos.add(position));
        pos.scale(1/this.lastPositions.getSize());

        // Set this position either to the object or to its bounds
        pos.x = MathUtils.clamp(pos.x, this.boundary.left + this.view.hw, this.boundary.right - this.view.hw);
        pos.y = MathUtils.clamp(pos.y, this.boundary.top + this.view.hh, this.boundary.bottom - this.view.hh);

        // Assure there are no lines in the tilemap
        pos.x = Math.floor(pos.x);
        pos.y = Math.floor(pos.y);
        
        this.view.center.copy(pos);
    }

    update(deltaT: number): void {
        // If zoom is enabled
        if(this.scrollZoomEnabled){
            if(Input.didJustScroll()){
                let currentSize = this.view.getHalfSize().clone();
                if(Input.getScrollDirection() < 0){
                    // Zoom in
                    currentSize.scale(1/this.ZOOM_FACTOR);
                } else {
                    // Zoom out
                    currentSize.scale(this.ZOOM_FACTOR);
                }

                if(currentSize.x > this.boundary.hw){
                    let factor = this.boundary.hw/currentSize.x;
                    currentSize.x = this.boundary.hw;
                    currentSize.y *= factor;
                }

                if(currentSize.y > this.boundary.hh){
                    let factor = this.boundary.hh/currentSize.y;
                    currentSize.y = this.boundary.hh;
                    currentSize.x *= factor;
                }

                this.view.setHalfSize(currentSize);
            }
        }

        // If viewport is following an object
        if(this.following){
            // Update our list of previous positions
            this.lastPositions.enqueue(this.following.position.clone());
        } else {
            this.lastPositions.enqueue(this.focus);
        }

        this.updateView();
    }
}