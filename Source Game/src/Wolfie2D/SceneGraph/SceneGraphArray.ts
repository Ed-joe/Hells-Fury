import SceneGraph from "./SceneGraph";
import CanvasNode from "../Nodes/CanvasNode";
import Viewport from "./Viewport";
import Scene from "../Scene/Scene";
import AABB from "../DataTypes/Shapes/AABB";
import Stats from "../Debug/Stats";

/**
 * An implementation of a SceneGraph that simply stored CanvasNodes in an array.
 */
export default class SceneGraphArray extends SceneGraph {
    /** The list of CanvasNodes in this SceneGraph */
    private nodeList: Array<CanvasNode>;

    /**
     * Creates a new SceneGraphArray
     * @param viewport The Viewport
     * @param scene The Scene this SceneGraph belongs to
     */
    constructor(viewport: Viewport, scene: Scene){
        super(viewport, scene);

        this.nodeList = new Array<CanvasNode>();
    }

    // @override
    protected addNodeSpecific(node: CanvasNode, id: number): void {
        this.nodeList.push(node);
    }

    // @override
    protected removeNodeSpecific(node: CanvasNode, id: number): void {
        let index = this.nodeList.indexOf(node);
        if(index > -1){
            this.nodeList.splice(index, 1);
        }
    }

    // @override
    getNodesAtCoords(x: number, y: number): Array<CanvasNode> {
        let results = [];

        for(let node of this.nodeList){
            if(node.contains(x, y)){
                results.push(node);
            }
        }

        return results;
    }

    // @override
    getNodesInRegion(boundary: AABB): Array<CanvasNode> {
        let t0 = performance.now();
        let results = [];

        for(let node of this.nodeList){
            if(boundary.overlaps(node.boundary)){
                results.push(node);
            }
        }
        let t1 = performance.now();
        Stats.log("sgquery", (t1-t0));

        return results;
    }

    update(deltaT: number): void {
        let t0 = performance.now();
        for(let node of this.nodeList){
            if(!node.getLayer().isPaused()){
                node.update(deltaT);
            }
        }
        let t1 = performance.now();
        Stats.log("sgupdate", (t1-t0));
    }

    render(ctx: CanvasRenderingContext2D): void {}

    // @override
    getVisibleSet(): Array<CanvasNode> {
        let visibleSet = new Array<CanvasNode>();

        for(let node of this.nodeList){
            if(!node.getLayer().isHidden() && node.visible && this.viewport.includes(node)){
                visibleSet.push(node);
            }
        }

        return visibleSet;
    }
}