import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import Sprite from "../../../Wolfie2D/Nodes/Sprites/Sprite";

export default abstract class Item {
    /** The sprite that represents this weapon in the world or in an inventory */
    sprite: Sprite;

    constructor(sprite: Sprite){
        this.sprite = sprite;
    }

    moveSprite(position: Vec2, layer?: string){
        // Change the layer if needed
        if(layer){
            let currentLayer = this.sprite.getLayer();
            currentLayer.removeNode(this.sprite);
            let newLayer = this.sprite.getScene().getLayer(layer);
            newLayer.addNode(this.sprite);
            this.sprite.setLayer(newLayer);
        }

        // Move the sprite
        this.sprite.position.copy(position);
    }

    abstract use(user: GameNode, ...args: any): void;
}