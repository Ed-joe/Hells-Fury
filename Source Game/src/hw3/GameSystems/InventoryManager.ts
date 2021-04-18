import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import Item from "./items/Item";

export default class InventoryManager {

    private position: Vec2;
    private items: Array<Item>;
    private inventorySlots: Array<Sprite>;
    private slotSize: Vec2;
    private padding: number;
    private currentSlot: number;
    private slotLayer: string;
    private itemLayer: string;
    private selectedSlot: Rect;

    constructor(scene: Scene, size: number, inventorySlot: string, position: Vec2, padding: number){
        this.items = new Array(size);
        this.inventorySlots = new Array(size);
        this.padding = padding;
        this.position = position;
        this.currentSlot = 0;

        // Add layers
        this.slotLayer = "slots";
        scene.addUILayer(this.slotLayer).setDepth(100);
        this.itemLayer = "items";
        scene.addUILayer(this.itemLayer).setDepth(101);

        // Create the inventory slots
        for(let i = 0; i < size; i++){
            this.inventorySlots[i] = scene.add.sprite(inventorySlot, this.slotLayer);
        }

        this.slotSize = this.inventorySlots[0].size.clone();

        // Position the inventory slots
        for(let i = 0; i < size; i++){
            this.inventorySlots[i].position.set(position.x + i*(this.slotSize.x + this.padding), position.y);
        }

        // Add a rect for the selected slot
        this.selectedSlot = <Rect>scene.add.graphic(GraphicType.RECT, "slots", {position: this.position.clone(), size: this.slotSize.clone().inc(-2)});
        this.selectedSlot.color = Color.WHITE;
        this.selectedSlot.color.a = 0.2;
    }

    getItem(): Item {
        return this.items[this.currentSlot];
    }

    /**
     * Changes the currently selected slot
     */
    changeSlot(slot: number): void {
        this.currentSlot = slot;
        this.selectedSlot.position.copy(this.inventorySlots[slot].position);
    }

    /**
     * Gets the currently selected slot
     */
    getSlot(): number {
        return this.currentSlot;
    }

    /**
     * Adds an item to the currently selected slot
     */
    addItem(item: Item): boolean {
        if(!this.items[this.currentSlot]){
            // Add the item to the inventory
            this.items[this.currentSlot] = item;
            
            // Update the gui
            item.moveSprite(new Vec2(this.position.x + this.currentSlot*(this.slotSize.x + this.padding), this.position.y), this.itemLayer);

            return true;
        }
        
        // Failed to add item, something was already in the slot
        return false;
    }

    /**
     * Removes and returns an item from the the currently selected slot, if possible
     */
    removeItem(): Item {
        let item = this.items[this.currentSlot];

        this.items[this.currentSlot] = null;

        if(item){
            return item;
        } else {
            return null;
        }
    }
}