import ResourceManager from "../../ResourceManager/ResourceManager";
import Vec2 from "../Vec2";
import { TiledTilesetData } from "./TiledData";

/**
 * The data representation of a Tileset for the game engine. This represents one image,
 * with a startIndex if required (as it is with Tiled using two images in one tilset).
 */
export default class Tileset {
    /** The key of the image used by this tileset */
    protected imageKey: string;
    /** The size of the tileset image */
    protected imageSize: Vec2;
    /** The index of 0th image of this tileset */
    protected startIndex: number;
    /** The index of the last image of this tilset */
    protected endIndex: number;
    /** The size of the tiles in this tileset */
    protected tileSize: Vec2;
    /** The number of rows in this tileset */
    protected numRows: number;
    /** The number of columns in this tileset */
    protected numCols: number;

    // TODO: Change this to be more general and work with other tileset formats
    constructor(tilesetData: TiledTilesetData){
        // Defer handling of the data to a helper class
        this.initFromTiledData(tilesetData);
    }

    /**
     * Initialize the tileset from the data from a Tiled json file
     * @param tiledData The parsed object from a Tiled json file
     */
    initFromTiledData(tiledData: TiledTilesetData): void {
        this.numRows = tiledData.tilecount/tiledData.columns;
        this.numCols = tiledData.columns;
        this.startIndex = tiledData.firstgid;
        this.endIndex = this.startIndex + tiledData.tilecount - 1;
        this.tileSize = new Vec2(tiledData.tilewidth, tiledData.tilewidth);
        this.imageKey = tiledData.image;
        this.imageSize = new Vec2(tiledData.imagewidth, tiledData.imageheight);
    }

    /** 
     * Gets the image key associated with this tilemap
     * @returns The image key of this tilemap
     */
    getImageKey(): string {
        return this.imageKey;
    }

    /**
     * Returns a Vec2 containing the left and top offset from the image origin for this tile.
     * @param tileIndex The index of the tile from startIndex to endIndex of this tileset
     * @returns A Vec2 containing the offset for the specified tile.
     */
    getImageOffsetForTile(tileIndex: number): Vec2 {
        // Get the true index
        let index = tileIndex - this.startIndex;
        let row = Math.floor(index / this.numCols);
        let col = index % this.numCols;
        let width = this.tileSize.x;
        let height = this.tileSize.y;

        // Calculate the position to start a crop in the tileset image
        let left = col * width;
        let top = row * height;

        return new Vec2(left, top);
    }

    /**
     * Gets the start index
     * @returns The start index
     */
    getStartIndex(): number {
        return this.startIndex;
    }

    /**
     * Gets the tile set
     * @returns A Vec2 containing the tile size
     */
    getTileSize(): Vec2 {
        return this.tileSize;
    }

    /**
     * Gets the number of rows in the tileset
     * @returns The number of rows
     */
    getNumRows(): number {
        return this.numRows;
    }

    /**
     * Gets the number of columns in the tilset
     * @returns The number of columns
     */
    getNumCols(): number {
        return this.numCols;
    }

    getTileCount(): number {
        return this.endIndex - this.startIndex + 1;
    }

    /**
     * Checks whether or not this tilset contains the specified tile index. This is used for rendering.
     * @param tileIndex The index of the tile to check
     * @returns A boolean representing whether or not this tilset uses the specified index
     */
    hasTile(tileIndex: number): boolean {
        return tileIndex >= this.startIndex && tileIndex <= this.endIndex;
    }

    /**
     * Render a singular tile with index tileIndex from the tileset located at position dataIndex
     * @param ctx The rendering context
     * @param tileIndex The value of the tile to render
     * @param dataIndex The index of the tile in the data array
     * @param worldSize The size of the world
     * @param origin The viewport origin in the current layer
     * @param scale The scale of the tilemap
     */
    renderTile(ctx: CanvasRenderingContext2D, tileIndex: number, dataIndex: number, maxCols: number, origin: Vec2, scale: Vec2, zoom: number): void {
        let image = ResourceManager.getInstance().getImage(this.imageKey);

        // Get the true index
        let index = tileIndex - this.startIndex;
        let row = Math.floor(index / this.numCols);
        let col = index % this.numCols;
        let width = this.tileSize.x;
        let height = this.tileSize.y;

        // Calculate the position to start a crop in the tileset image
        let left = col * width;
        let top = row * height;

        // Calculate the position in the world to render the tile
        let x = Math.floor((dataIndex % maxCols) * width * scale.x);
        let y = Math.floor(Math.floor(dataIndex / maxCols) * height * scale.y);
        ctx.drawImage(image, left, top, width, height, Math.floor((x - origin.x)*zoom), Math.floor((y - origin.y)*zoom), Math.ceil(width * scale.x * zoom), Math.ceil(height * scale.y * zoom));
    }
}