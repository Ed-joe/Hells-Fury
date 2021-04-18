import Vec2 from "./Vec2";
import Collection from "./Collection";
import AABB from "./Shapes/AABB"
import Positioned from "./Interfaces/Positioned";

// TODO - Make max depth

// @ignorePage

/**
 * Primarily used to organize the scene graph
 */
export default class QuadTree<T extends Positioned> implements Collection {
    /**
     * The center of this quadtree
     */
    protected boundary: AABB;

    /**
     * The number of elements this quadtree root can hold before splitting
     */
    protected capacity: number;

    /**
     * The maximum height of the quadtree from this root
     */
    protected maxDepth: number;

    /**
     * Represents whether the quadtree is a root or a leaf
     */
    protected divided: boolean;

    /**
     * The array of the items in this quadtree
     */
    protected items: Array<T>;

    // The child quadtrees of this one
    protected nw: QuadTree<T>;
    protected ne: QuadTree<T>;
    protected sw: QuadTree<T>;
    protected se: QuadTree<T>;

    constructor(center: Vec2, size: Vec2, maxDepth?: number, capacity?: number){
        this.boundary = new AABB(center, size);
        this.maxDepth = maxDepth !== undefined ? maxDepth : 10
        this.capacity = capacity ? capacity : 10;
        
        // If we're at the bottom of the tree, don't set a max size
        if(this.maxDepth === 0){
            this.capacity = Infinity;
        }

        this.divided = false;
        this.items = new Array();
    }

    /**
     * Inserts a new item into this quadtree. Defers to children if this quadtree is divided
     * or divides the quadtree if capacity is exceeded with this add.
     * @param item The item to add to the quadtree
     */
    insert(item: T){
        // If the item is inside of the bounds of this quadtree
        if(this.boundary.containsPointSoft(item.position)){
            if(this.divided){
                // Defer to the children
                this.deferInsert(item);
            } else if (this.items.length < this.capacity){
                // Add to this items list
                this.items.push(item);
            } else {
                // We aren't divided, but are at capacity - divide
                this.subdivide();
                this.deferInsert(item);
                this.divided = true;
            }
        }
    }

    /**
     * Divides this quadtree up into 4 smaller ones - called through insert.
     */
    protected subdivide(): void {
        let x = this.boundary.x;
        let y = this.boundary.y;
        let hw = this.boundary.hw;
        let hh = this.boundary.hh;

        this.nw = new QuadTree(new Vec2(x-hw/2, y-hh/2), new Vec2(hw/2, hh/2), this.maxDepth - 1);
        this.ne = new QuadTree(new Vec2(x+hw/2, y-hh/2), new Vec2(hw/2, hh/2), this.maxDepth - 1)
        this.sw = new QuadTree(new Vec2(x-hw/2, y+hh/2), new Vec2(hw/2, hh/2), this.maxDepth - 1)
        this.se = new QuadTree(new Vec2(x+hw/2, y+hh/2), new Vec2(hw/2, hh/2), this.maxDepth - 1)

        this.distributeItems();
    }

    /**
     * Distributes the items of this quadtree into its children.
     */
    protected distributeItems(): void {
        this.items.forEach(item => this.deferInsert(item));

        // Delete the items from this array
        this.items.forEach((item, index) => delete this.items[index]);
        this.items.length = 0;
    }

    /**
     * Defers this insertion to the children of this quadtree 
     * @param item 
     */
    protected deferInsert(item: T): void {
        this.nw.insert(item);
        this.ne.insert(item);
        this.sw.insert(item);
        this.se.insert(item);
    }

    /**
     * Renders the quadtree for demo purposes.
     * @param ctx 
     */
    public render_demo(ctx: CanvasRenderingContext2D): void {
        ctx.strokeStyle = "#FF0000";
        ctx.strokeRect(this.boundary.x - this.boundary.hw, this.boundary.y - this.boundary.hh, 2*this.boundary.hw, 2*this.boundary.hh);

        if(this.divided){
            this.nw.render_demo(ctx);
            this.ne.render_demo(ctx);
            this.sw.render_demo(ctx);
            this.se.render_demo(ctx);
        }
    }

    forEach(func: Function): void {
        // If divided, send the call down
        if(this.divided){
            this.nw.forEach(func);
            this.ne.forEach(func);
            this.sw.forEach(func);
            this.se.forEach(func);
        } else {
            // Otherwise, iterate over items
            for(let i = 0; i < this.items.length; i++){
                func(this.items[i]);
            }
        }
    }

    clear(): void {
        throw new Error("Method not implemented.");
    }

}