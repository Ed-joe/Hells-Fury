import Vec2 from "../../DataTypes/Vec2";
import Button from "../../Nodes/UIElements/Button";
import Label from "../../Nodes/UIElements/Label";
import Slider from "../../Nodes/UIElements/Slider";
import TextInput from "../../Nodes/UIElements/TextInput";
import ResourceManager from "../../ResourceManager/ResourceManager";
import Scene from "../../Scene/Scene";
import MathUtils from "../../Utils/MathUtils";

/**
 * A utility class to help the @reference[CanvasRenderer] render @reference[UIElement]s
 */
export default class UIElementRenderer {
    protected resourceManager: ResourceManager;
    protected scene: Scene;
    protected ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D){
        this.resourceManager = ResourceManager.getInstance();
        this.ctx = ctx;
    }

    /**
     * Sets the scene of this UIElementRenderer
     * @param scene The current scene
     */
    setScene(scene: Scene): void {
        this.scene = scene;
    }

    /**
     * Renders a label
     * @param label The label to render
     */
    renderLabel(label: Label): void {
        // If the size is unassigned (by the user or automatically) assign it
        label.handleInitialSizing(this.ctx);
		
		// Grab the global alpha so we can adjust it for this render
		let previousAlpha = this.ctx.globalAlpha;

        // Get the font and text position in label
		this.ctx.font = label.getFontString();
		let offset = label.calculateTextOffset(this.ctx);

		// Stroke and fill a rounded rect and give it text
		this.ctx.globalAlpha = label.backgroundColor.a;
		this.ctx.fillStyle = label.calculateBackgroundColor().toStringRGBA();
		this.ctx.fillRoundedRect(-label.size.x/2, -label.size.y/2,
			label.size.x, label.size.y, label.borderRadius);
		
		this.ctx.strokeStyle = label.calculateBorderColor().toStringRGBA();
		this.ctx.globalAlpha = label.borderColor.a;
		this.ctx.lineWidth = label.borderWidth;
		this.ctx.strokeRoundedRect(-label.size.x/2, -label.size.y/2,
			label.size.x, label.size.y, label.borderRadius);

		this.ctx.fillStyle = label.calculateTextColor();
		this.ctx.globalAlpha = label.textColor.a;
		this.ctx.fillText(label.text, offset.x - label.size.x/2, offset.y - label.size.y/2);
	
		this.ctx.globalAlpha = previousAlpha;
    }

    /**
     * Renders a button
     * @param button The button to render
     */
    renderButton(button: Button): void {
        this.renderLabel(button);
    }

    /**
     * Renders a slider
     * @param slider The slider to render
     */
    renderSlider(slider: Slider): void {
		// Grab the global alpha so we can adjust it for this render
		let previousAlpha = this.ctx.globalAlpha;
		this.ctx.globalAlpha = slider.getLayer().getAlpha();

        // Calcualate the slider size
        let sliderSize = new Vec2(slider.size.x, 2);

        // Draw the slider
		this.ctx.fillStyle = slider.sliderColor.toString();
		this.ctx.fillRoundedRect(-sliderSize.x/2, -sliderSize.y/2,
            sliderSize.x, sliderSize.y, slider.borderRadius);

        // Calculate the nib size and position
        let x = MathUtils.lerp(-slider.size.x/2, slider.size.x/2, slider.getValue());

        // Draw the nib
		this.ctx.fillStyle = slider.nibColor.toString();
		this.ctx.fillRoundedRect(x-slider.nibSize.x/2, -slider.nibSize.y/2,
            slider.nibSize.x, slider.nibSize.y, slider.borderRadius);

        // Reset the alpha
        this.ctx.globalAlpha = previousAlpha;
    }

    /**
     * Renders a textInput
     * @param textInput The textInput to render
     */
    renderTextInput(textInput: TextInput): void {
        // Show a cursor sometimes
        if(textInput.focused && textInput.cursorCounter % 60 > 30){
            textInput.text += "|";
        }

        this.renderLabel(textInput);

        if(textInput.focused){
            if(textInput.cursorCounter % 60 > 30){
                textInput.text = textInput.text.substring(0, textInput.text.length - 1);
            }

            textInput.cursorCounter += 1;
            if(textInput.cursorCounter >= 60){
                textInput.cursorCounter = 0;
            }
        }
    }

}