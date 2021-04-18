// @ignorePage
/**
 * a representation of Tiled's tilemap data
 */
export class TiledTilemapData {
    height: number;
    width: number;
    tileheight: number;
    tilewidth: number;
    orientation: string;
    layers: Array<TiledLayerData>;
    tilesets: Array<TiledTilesetData>;
}

/**
 * A representation of a custom layer property in a Tiled tilemap
 */
export class TiledLayerProperty {
    name: string;
    type: string;
    value: any;
}

/**
 * A representation of a tileset in a Tiled tilemap
 */
export class TiledTilesetData {
    columns: number;
    tilewidth: number;
    tileheight: number;
    tilecount: number;
    firstgid: number;
    imageheight: number;
    imagewidth: number;
    margin: number;
    spacing: number;
    name: string;
    image: string;
    tiles: Array<TiledCollectionTile>
}

/**
 * A representation of a layer in a Tiled tilemap
 */
export class TiledLayerData {
    data: number[];
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
    opacity: number;
    visible: boolean;
    properties: TiledLayerProperty[];
    type: string;
    objects: Array<TiledObject>;
}

export class TiledObject {
    gid: number;
    height: number;
    width: number;
    id: number;
    name: string;;
    properties: Array<TiledLayerProperty>;
    rotation: number;
    type: string;
    visible: boolean;
    x: number;
    y: number;
}

export class TiledCollectionTile {
    id: number;
    image: string;
    imageheight: number;
    imagewidth: number;
}
