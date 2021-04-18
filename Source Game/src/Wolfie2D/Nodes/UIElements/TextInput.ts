import Vec2 from "../../DataTypes/Vec2";
import Color from "../../Utils/Color";
import Label from "./Label";
import Input from "../../Input/Input";

/** A text input UIElement */
export default class TextInput extends Label {
    /** A flag the represents whether the user can type in this TextInput */
    focused: boolean;
    /** The position of the cursor in this TextInput */
    cursorCounter: number;

    constructor(position: Vec2){
        super(position, "");

        this.focused = false;
        this.cursorCounter = 0;

        // Give a default size to the x only
        this.size.set(200, this.fontSize);
        this.hAlign = "left";

        this.borderColor = Color.BLACK;
        this.backgroundColor = Color.WHITE;
    }

    update(deltaT: number): void {
        super.update(deltaT);

        if(Input.isMouseJustPressed()){
			let clickPos = Input.getMousePressPosition();
			if(this.contains(clickPos.x, clickPos.y)){
                this.focused = true;
                this.cursorCounter = 30;
            } else {
                this.focused = false;
            }
        }

        if(this.focused){
            let keys = Input.getKeysJustPressed();
            let nums = "1234567890";
            let specialChars = "`~!@#$%^&*()-_=+[{]}\\|;:'\",<.>/?";
            let letters = "qwertyuiopasdfghjklzxcvbnm";
            let mask = nums + specialChars + letters;
            keys = keys.filter(key => mask.includes(key));
            let shiftPressed = Input.isKeyPressed("shift");
            let backspacePressed = Input.isKeyJustPressed("backspace");
            let spacePressed = Input.isKeyJustPressed("space");
            
            if(backspacePressed){
                this.text = this.text.substring(0, this.text.length - 1);
            } else if(spacePressed){
                this.text += " ";
            } else if(keys.length > 0) {
                if(shiftPressed){
                    this.text += keys[0].toUpperCase();
                } else {
                    this.text += keys[0];
                }
            }
        }
    }
}