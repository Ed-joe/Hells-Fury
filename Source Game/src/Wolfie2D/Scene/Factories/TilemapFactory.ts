import Scene from "../Scene";
import Tilemap from "../../Nodes/Tilemap";
import ResourceManager from "../../ResourceManager/ResourceManager";
import OrthogonalTilemap from "../../Nodes/Tilemaps/OrthogonalTilemap";
import Layer from "../Layer";
import Tileset from "../../DataTypes/Tilesets/Tileset";
import Vec2 from "../../DataTypes/Vec2";
import { TiledCollectionTile } from "../../DataTypes/Tilesets/TiledData";
import Sprite from "../../Nodes/Sprites/Sprite";
import PositionGraph from "../../DataTypes/Graphs/PositionGraph";
import Navmesh from "../../Pathfinding/Navmesh";

// @ignorePage

/**
 * A factory that abstracts adding @reference[Tilemap]s to the @reference[Scene].
 * Access methods in this factory through Scene.add.[methodName]().
 */
export default class TilemapFactory {
    private scene: Scene;
    private tilemaps: Array<Tilemap>;
    private resourceManager: ResourceManager;
    
    init(scene: Scene, tilemaps: Array<Tilemap>): void {
        this.scene = scene;
        this.tilemaps = tilemaps;
        this.resourceManager = ResourceManager.getInstance();
    }

    // TODO - This is specifically catered to Tiled tilemaps right now. In the future,
    // it would be good to have a "parseTilemap" function that would convert the tilemap
    // data into a standard format. This could allow for support from other programs
    // or the development of an internal level builder tool
    /**
     * Adds a tilemap to the scene
     * @param key The key of the loaded tilemap to load
     * @param constr The constructor of the desired tilemap
     * @param args Additional arguments to send to the tilemap constructor
     * @returns An array of Layers, each of which contains a layer of the tilemap as its own Tilemap instance.
     */
	add = (key: string, scale: Vec2 = new Vec2(1, 1)): Array<Layer> => {
        // Get Tilemap Data
        let tilemapData = this.resourceManager.getTilemap(key);

        // Set the constructor for this tilemap to either be orthographic or isometric
        let constr: new(...args: any) => Tilemap;
        if(tilemapData.orientation === "orthographic"){
            constr = OrthogonalTilemap;
        } else {
            // No isometric tilemap support right now, so Orthographic tilemap
            constr = OrthogonalTilemap;
        }

        // Initialize the return value array
        let sceneLayers = new Array<Layer>();

        // Create all of the tilesets for this tilemap
        let tilesets = new Array<Tileset>();

        let collectionTiles = new Array<TiledCollectionTile>();

        for(let tileset of tilemapData.tilesets){
            if(tileset.image){
                // If this is a standard tileset and not a collection, create a tileset for it.
                // TODO - We are ignoring collection tilesets for now. This is likely not a great idea in practice,
                // as theoretically someone could want to use one for a standard tilemap. We are assuming for now
                // that we only want to use them for object layers
                tilesets.push(new Tileset(tileset));
            } else {
                tileset.tiles.forEach(tile => tile.id += tileset.firstgid);
                collectionTiles.push(...tileset.tiles);
            }
        }

        // Loop over the layers of the tilemap and create tiledlayers or object layers
        for(let layer of tilemapData.layers){

            let sceneLayer;
            let isParallaxLayer = false;
            let depth = 0;
            
            if(layer.properties){
                for(let prop of layer.properties){
                    if(prop.name === "Parallax"){
                        isParallaxLayer = prop.value;
                    } else if(prop.name === "Depth") {
                        depth = prop.value;
                    }
                }
            }

            if(isParallaxLayer){
                sceneLayer = this.scene.addParallaxLayer(layer.name, new Vec2(1, 1), depth);
            } else {
                sceneLayer = this.scene.addLayer(layer.name, depth);
            }
            
            if(layer.type === "tilelayer"){
                // Create a new tilemap object for the layer
                let tilemap = new constr(tilemapData, layer, tilesets, scale);
                tilemap.id = this.scene.generateId();
                tilemap.setScene(this.scene);
    
                // Add tilemap to scene
                this.tilemaps.push(tilemap);
    
                sceneLayer.addNode(tilemap);
    
                // Register tilemap with physics if it's collidable
                if(tilemap.isCollidable){
                    tilemap.addPhysics();

                    if(layer.properties){
                        for(let item of layer.properties){
                            if(item.name === "Group"){
                                tilemap.setGroup(item.value);
                            }
                        }
                    }
                }
            } else {

                let isNavmeshPoints = false;
                let navmeshName;
                let edges;
                if(layer.properties){
                    for(let prop of layer.properties){
                        if(prop.name === "NavmeshPoints"){
                            isNavmeshPoints = true;
                        } else if(prop.name === "name"){
                            navmeshName = prop.value;
                        } else if(prop.name === "edges"){
                            edges = prop.value
                        }
                    }
                }
                
                if(isNavmeshPoints){
                    let g = new PositionGraph();

                    for(let obj of layer.objects){
                        g.addPositionedNode(new Vec2(obj.x, obj.y));
                    }

                    for(let edge of edges){
                        g.addEdge(edge.from, edge.to);
                    }

                    this.scene.getNavigationManager().addNavigableEntity(navmeshName, new Navmesh(g));

                    continue;
                }

                // Layer is an object layer, so add each object as a sprite to a new layer
                for(let obj of layer.objects){
                    // Check if obj is collidable
                    let hasPhysics = false;
                    let isCollidable = false;
                    let isTrigger = false;
                    let onEnter = null;
                    let onExit = null;
                    let triggerGroup = null;
                    let group = "";

                    if(obj.properties){
                        for(let prop of obj.properties){
                            if(prop.name === "HasPhysics"){
                                hasPhysics = prop.value;
                            } else if(prop.name === "Collidable"){
                                isCollidable = prop.value;
                            } else if(prop.name === "Group"){
                                group = prop.value;
                            } else if(prop.name === "IsTrigger"){
                                isTrigger = prop.value;
                            } else if(prop.name === "TriggerGroup"){
                                triggerGroup = prop.value;
                            } else if(prop.name === "TriggerOnEnter"){
                                onEnter = prop.value;
                            } else if(prop.name === "TriggerOnExit"){
                                onExit = prop.value;
                            }
                        }
                    }

                    let sprite: Sprite;

                    // Check if obj is a tile from a tileset
                    for(let tileset of tilesets){
                        if(tileset.hasTile(obj.gid)){
                            // The object is a tile from this set
                            let imageKey = tileset.getImageKey();
                            let offset = tileset.getImageOffsetForTile(obj.gid);
                            sprite = this.scene.add.sprite(imageKey, layer.name);
                            let size = tileset.getTileSize().clone();
                            sprite.position.set((obj.x + size.x/2)*scale.x, (obj.y - size.y/2)*scale.y);
                            sprite.setImageOffset(offset);
                            sprite.size.copy(size);
                            sprite.scale.set(scale.x, scale.y);
                        }
                    }

                    // Not in a tileset, must correspond to a collection
                    if(!sprite){
                        for(let tile of collectionTiles){
                            if(obj.gid === tile.id){
                                let imageKey = tile.image;
                                sprite = this.scene.add.sprite(imageKey, layer.name);
                                sprite.position.set((obj.x + tile.imagewidth/2)*scale.x, (obj.y - tile.imageheight/2)*scale.y);
                                sprite.scale.set(scale.x, scale.y);
                            }
                        }
                    }

                    // Now we have sprite. Associate it with our physics object if there is one
                    if(hasPhysics){
                        // Make the sprite a static physics object
                        sprite.addPhysics(sprite.boundary.clone(), Vec2.ZERO, isCollidable, true);
                        sprite.setGroup(group);
                        if(isTrigger && triggerGroup !== null){
                            sprite.setTrigger(triggerGroup, onEnter, onExit);
                        }
                    }
                }
            }

            // Update the return value
            sceneLayers.push(sceneLayer);
        }

        return sceneLayers;
	}
}