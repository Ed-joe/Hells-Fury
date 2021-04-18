import Tilemap from "../Tilemap";
import Vec2 from "../../DataTypes/Vec2";
import { TiledTilemapData, TiledLayerData } from "../../DataTypes/Tilesets/TiledData";
import Debug from "../../Debug/Debug";
import Color from "../../Utils/Color";

/**
 * The representation of an orthogonal tilemap - i.e. a top down or platformer tilemap
 */
export default class OrthogonalTilemap extends Tilemap {
    /** The number of columns in the tilemap */
    protected numCols: number;
    /** The number of rows in the tilemap */
    protected numRows: number;

    // @override
    protected parseTilemapData(tilemapData: TiledTilemapData, layer: TiledLayerData): void {
        // The size of the tilemap in local space
        this.numCols = tilemapData.width;
        this.numRows = tilemapData.height;

        // The size of tiles
        this.tileSize.set(tilemapData.tilewidth, tilemapData.tileheight);

        // The size of the tilemap on the canvas
        this.size.set(this.numCols * this.tileSize.x, this.numRows * this.tileSize.y);
        this.position.copy(this.size.scaled(0.5));
        this.data = layer.data;
        this.visible = layer.visible;

        // Whether the tilemap is collidable or not
        this.isCollidable = false;
        if(layer.properties){
            for(let item of layer.properties){
                if(item.name === "Collidable"){
                    this.isCollidable = item.value;

                    // Set all tiles besides "empty: 0" to be collidable
                    for(let i = 1; i < this.collisionMap.length; i++){
                        this.collisionMap[i] = true;
                    }
                }
            }
        }
    }

    /**
     * Gets the dimensions of the tilemap
     * @returns A Vec2 containing the number of columns and the number of rows in the tilemap.
     */
    getDimensions(): Vec2 {
        return new Vec2(this.numCols, this.numRows);
    }

    /**
     * Gets the data value of the tile at the specified world position
     * @param worldCoords The coordinates in world space
     * @returns The data value of the tile
     */
    getTileAtWorldPosition(worldCoords: Vec2): number {
        let localCoords = this.getColRowAt(worldCoords);
        return this.getTileAtRowCol(localCoords);
    }

    /**
     * Get the tile at the specified row and column
     * @param rowCol The coordinates in tilemap space
     * @returns The data value of the tile
     */
    getTileAtRowCol(rowCol: Vec2): number {
        if(rowCol.x < 0 || rowCol.x >= this.numCols || rowCol.y < 0 || rowCol.y >= this.numRows){
            return -1;
        }

        return this.data[rowCol.y * this.numCols + rowCol.x];
    }

    /**
     * Gets the world position of the tile at the specified index
     * @param index The index of the tile
     * @returns A Vec2 containing the world position of the tile
     */
    getTileWorldPosition(index: number): Vec2 {
        // Get the local position
        let col = index % this.numCols;
        let row = Math.floor(index / this.numCols);

        // Get the world position
        let x = col * this.tileSize.x;
        let y = row * this.tileSize.y;

        return new Vec2(x, y);
    }

    /**
     * Gets the data value of the tile at the specified index
     * @param index The index of the tile
     * @returns The data value of the tile
     */
    getTile(index: number): number {
        return this.data[index];
    }

    // @override
    setTile(index: number, type: number): void {
        this.data[index] = type;
    }

    /**
     * Sets the tile at the specified row and column
     * @param rowCol The position of the tile in tilemap space
     * @param type The new data value of the tile
     */
    setTileAtRowCol(rowCol: Vec2, type: number): void {
        let index = rowCol.y * this.numCols + rowCol.x;
        this.setTile(index, type);
    }

    /**
     * Returns true if the tile at the specified row and column of the tilemap is collidable
     * @param indexOrCol The index of the tile or the column it is in
     * @param row The row the tile is in
     * @returns A flag representing whether or not the tile is collidable.
     */
    isTileCollidable(indexOrCol: number, row?: number): boolean {
        // The value of the tile
        let tile = 0;

        if(row){
            // We have a column and a row
            tile = this.getTileAtRowCol(new Vec2(indexOrCol, row));

            if(tile < 0){
                return false;
            }
        } else {
            if(indexOrCol < 0 || indexOrCol >= this.data.length){
                // Tiles that don't exist aren't collidable
                return false;
            }
            // We have an index
            tile = this.getTile(indexOrCol);
        }

        return this.collisionMap[tile];
    }

    /**
     * Takes in world coordinates and returns the row and column of the tile at that position
     * @param worldCoords The coordinates of the potential tile in world space
     * @returns A Vec2 containing the coordinates of the potential tile in tilemap space
     */
    getColRowAt(worldCoords: Vec2): Vec2 {
        let col = Math.floor(worldCoords.x / this.tileSize.x / this.scale.x);
        let row = Math.floor(worldCoords.y / this.tileSize.y / this.scale.y);

        return new Vec2(col, row);
    }

    // @override
    update(deltaT: number): void {}

    // @override
    debugRender(){
        // Half of the tile size
        let zoomedHalfTileSize = this.getTileSizeWithZoom().scaled(0.5);
        let halfTileSize = this.getTileSize().scaled(0.5);

        // The center of the top left tile
        let topLeft = this.position.clone().sub(this.size.scaled(0.5));
        
        // A vec to store the center
        let center = Vec2.ZERO;

        for(let col = 0; col < this.numCols; col++){
            // Calculate the x-position
            center.x = topLeft.x + col*2*halfTileSize.x + halfTileSize.x;

            for(let row = 0; row < this.numRows; row++){
                if(this.isCollidable && this.isTileCollidable(col, row)){
                    // Calculate the y-position
                    center.y = topLeft.y + row*2*halfTileSize.y + halfTileSize.y;

                    // Draw a box for this tile
                    Debug.drawBox(this.inRelativeCoordinates(center), zoomedHalfTileSize, false, Color.BLUE);
                }
            }
        }
    }
}