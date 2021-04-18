import SceneGraph from "./SceneGraph";
import CanvasNode from "../Nodes/CanvasNode";
import Viewport from "./Viewport";
import Scene from "../Scene/Scene";
import RegionQuadTree from "../DataTypes/RegionQuadTree";
import Vec2 from "../DataTypes/Vec2";
import AABB from "../DataTypes/Shapes/AABB";
import Stats from "../Debug/Stats";

/**
 * An implementation of a SceneGraph that uses a @reference[RegionQuadTree] to store @reference[CanvasNode]s.
 */
export default class SceneGraphQuadTree extends SceneGraph {
    /** The QuadTree used to store the CanvasNodes */
    private qt: RegionQuadTree<CanvasNode>;

    /** A list of nodes to help out the QuadTree */
    private nodes: Array<CanvasNode>;

    /**
     * Creates a new SceneGraphQuadTree
     * @param viewport The Viewport
     * @param scene The Scene this SceneGraph belongs to
     */
    constructor(viewport: Viewport, scene: Scene){
        super(viewport, scene);

        let size = this.scene.getWorldSize();
        this.qt = new RegionQuadTree(size.clone().scale(1/2), size.clone().scale(1/2), 5, 30);
        this.nodes = new Array();
    }

    // @override
    protected addNodeSpecific(node: CanvasNode, id: number): void {
        this.nodes.push(node);
    }

    // @override
    protected removeNodeSpecific(node: CanvasNode, id: number): void {
        let index = this.nodes.indexOf(node);
        if(index >= 0){
            this.nodes.splice(index, 1);
        }
    }

    // @override
    getNodesAtCoords(x: number, y: number): Array<CanvasNode> {
        return this.qt.queryPoint(new Vec2(x, y));
    }

    // @override
    getNodesInRegion(boundary: AABB): Array<CanvasNode> {
        let t0 = performance.now();
        let res = this.qt.queryRegion(boundary);
        let t1 = performance.now();

        Stats.log("sgquery", (t1-t0));

        return res;
    }

    update(deltaT: number): void {
        let t0 = performance.now();
        this.qt.clear();
        let t1 = performance.now();

        Stats.log("sgclear", (t1-t0));

        t0 = performance.now();
        for(let node of this.nodes){
            this.qt.insert(node);
        }
        t1 = performance.now();

        Stats.log("sgfill", (t1-t0));

        t0 = performance.now();
        this.nodes.forEach((node: CanvasNode) => node.update(deltaT));
        t1 = performance.now();

        Stats.log("sgupdate", (t1-t0));
    }

    render(ctx: CanvasRenderingContext2D): void {
        let origin = this.viewport.getOrigin();
        let zoom = this.viewport.getZoomLevel();
        this.qt.render_demo(ctx, origin, zoom);
    }

    // @override
    getVisibleSet(): Array<CanvasNode> {
        let visibleSet = this.qt.queryRegion(this.viewport.getView());

        visibleSet = visibleSet.filter(node => !node.getLayer().isHidden());

        return visibleSet;
    }
}