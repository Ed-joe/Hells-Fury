import ResourceManager from "../../ResourceManager/ResourceManager";
import Scene from "../../Scene/Scene";
import OrthogonalTilemap from "../../Nodes/Tilemaps/OrthogonalTilemap";
import Vec2 from "../../DataTypes/Vec2";
import Tileset from "../../DataTypes/Tilesets/Tileset";

/**
 * A utility class for the @reference[CanvasRenderer] to render @reference[Tilemap]s
 */
export default class TilemapRenderer {
    protected resourceManager: ResourceManager;
    protected scene: Scene;
    protected ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D){
        this.resourceManager = ResourceManager.getInstance();
        this.ctx = ctx;
    }

    /**
     * Sets the scene of this TilemapRenderer
     * @param scene The current scene
     */
    setScene(scene: Scene): void {
        this.scene = scene;
    }

    /**
     * Renders an orthogonal tilemap
     * @param tilemap The tilemap to render
     */
    renderOrthogonalTilemap(tilemap: OrthogonalTilemap): void {
        let previousAlpha = this.ctx.globalAlpha;
        this.ctx.globalAlpha = tilemap.getLayer().getAlpha();
        
        let origin = this.scene.getViewTranslation(tilemap);
        let size = this.scene.getViewport().getHalfSize();
        let zoom = this.scene.getViewScale();
        let bottomRight = origin.clone().add(size.scaled(2*zoom));

        if(tilemap.visible){
            let minColRow = tilemap.getColRowAt(origin);
            let maxColRow = tilemap.getColRowAt(bottomRight);

            for(let x = minColRow.x; x <= maxColRow.x; x++){
                for(let y = minColRow.y; y <= maxColRow.y; y++){
                    // Get the tile at this position
                    let tile = tilemap.getTileAtRowCol(new Vec2(x, y));

                    // Extract the rot/flip parameters if there are any
                    const mask = (0xE << 28);
                    const rotFlip = ((mask & tile) >> 28) & 0xF;
                    tile = tile & ~mask;

                    // Find the tileset that owns this tile index and render
                    for(let tileset of tilemap.getTilesets()){
                        if(tileset.hasTile(tile)){
                            this.renderTile(tileset, tile, x, y, origin, tilemap.scale, zoom, rotFlip);
                        }
                    }
                }
            }
        }

        this.ctx.globalAlpha = previousAlpha;
    }

    /**
     * Renders a tile
     * @param tileset The tileset this tile belongs to 
     * @param tileIndex The index of the tile
     * @param tilemapRow The row of the tile in the tilemap
     * @param tilemapCol The column of the tile in the tilemap
     * @param origin The origin of the viewport
     * @param scale The scale of the tilemap
     * @param zoom The zoom level of the viewport
     */
    protected renderTile(tileset: Tileset, tileIndex: number, tilemapRow: number, tilemapCol: number, origin: Vec2, scale: Vec2, zoom: number, rotFlip: number): void {
        let image = this.resourceManager.getImage(tileset.getImageKey());

        // Get the true index
        let index = tileIndex - tileset.getStartIndex();

        // Get the row and col of the tile in image space
        let row = Math.floor(index / tileset.getNumCols());
        let col = index % tileset.getNumCols();
        let width = tileset.getTileSize().x;
        let height = tileset.getTileSize().y;

        // Calculate the position to start a crop in the tileset image
        let left = col * width;
        let top = row * height;

        // Calculate the position in the world to render the tile
        let x = Math.floor(tilemapRow * width * scale.x);
        let y = Math.floor(tilemapCol * height * scale.y);

        let worldX = Math.floor((x - origin.x)*zoom);
        let worldY = Math.floor((y - origin.y)*zoom);
        let worldWidth = Math.ceil(width * scale.x * zoom);
        let worldHeight = Math.ceil(height * scale.y * zoom);

        if(rotFlip !== 0){
            let scaleX = 1;
            let scaleY = 1;
            let shearX = 0;
            let shearY = 0;

            // Flip on the x-axis
            if(rotFlip & 8){
                scaleX = -1;
            }

            // Flip on the y-axis
            if(rotFlip & 4){
                scaleY = -1;
            }

            // Flip over the line y=x
            if(rotFlip & 2){
                shearX = scaleY;
                shearY = scaleX;
                scaleX = 0;
                scaleY = 0;
            }

            this.ctx.setTransform(scaleX, shearX, shearY, scaleY, worldX + worldWidth/2, worldY + worldHeight/2);
        
            // Render the tile
            this.ctx.drawImage(image,
                left, top,
                width, height,
                -worldWidth/2, -worldHeight/2,
                worldWidth, worldHeight);

            if(rotFlip !== 0){
                this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            }
        } else {
            // No rotations, don't do the calculations, just render the tile
            // Render the tile
            this.ctx.drawImage(image,
                left, top,
                width, height,
                worldX, worldY,
                worldWidth, worldHeight);
        }


    }
}