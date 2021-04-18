import Vec2 from "../../DataTypes/Vec2";
import Input from "../../Input/Input";
import Color from "../../Utils/Color";
import MathUtils from "../../Utils/MathUtils";
import UIElement from "../UIElement";

/** A slider UIElement */
export default class Slider extends UIElement {
    /** The value of the slider from [0, 1] */
    protected value: number;
    /** The color of the slider nib */
    public nibColor: Color;
    /** The size of the nib */
    public nibSize: Vec2;
    /** The color of the slider track */
    public sliderColor: Color;
    /** The reaction of this UIElement to a value change */
    public onValueChange: Function;
    /** The event propagated by this UIElement when value changes */
    public onValueChangeEventId: string;

    constructor(position: Vec2, initValue: number){
        super(position);

        this.value = initValue;
        this.nibColor = Color.RED;
        this.sliderColor = Color.BLACK;
        this.backgroundColor = Color.TRANSPARENT;
        this.borderColor = Color.TRANSPARENT;
        this.nibSize = new Vec2(10, 20);

        // Set a default size
        this.size.set(200, 20);
    }

    /**
     * Retrieves the value of the slider
     * @returns The value of the slider
     */
    getValue(): number {
        return this.value;
    }

    /** A method called in response to the value changing */
    protected valueChanged(): void {
        if(this.onValueChange){
            this.onValueChange(this.value);
        }

        if(this.onValueChangeEventId){
            this.emitter.fireEvent(this.onValueChangeEventId, {target: this, value: this.value});
        }
    }

    update(deltaT: number): void {
        super.update(deltaT);

        if(this.isClicked){
            let val = MathUtils.invLerp(this.position.x - this.size.x/2, this.position.x + this.size.x/2, Input.getMousePosition().x);
            this.value = MathUtils.clamp01(val);
            this.valueChanged();
        }
    }
}