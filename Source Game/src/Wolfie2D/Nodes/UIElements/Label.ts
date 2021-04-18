import Vec2 from "../../DataTypes/Vec2";
import Color from "../../Utils/Color";
import UIElement from "../UIElement";

/** A basic text-containing label */
export default class Label extends UIElement{
	/** The color of the text of this UIElement */
	textColor: Color;
	/** The value of the text of this UIElement */
	text: string;
	/** The name of the font */
	font: string;
	/** The size of the font */
	fontSize: number;
	/** The horizontal alignment of the text within the label */
	protected hAlign: string;
	/** The vertical alignment of text within the label */
	protected vAlign: string;

	/** A flag for if the width of the text has been measured on the canvas for auto width assignment */
	protected sizeAssigned: boolean;

	constructor(position: Vec2, text: string){
		super(position);
		this.text = text;
		this.textColor = new Color(0, 0, 0, 1);
		this.font = "Arial";
		this.fontSize = 30;
		this.hAlign = "center";
		this.vAlign = "center";

		this.sizeAssigned = false;
	}

	// @deprecated
	setText(text: string): void {
		this.text = text;
	}

	// @deprecated
	setTextColor(color: Color): void {
		this.textColor = color;
	}

	/**
	 * Gets a string containg the font details for rendering
	 * @returns A string containing the font details
	 */
	getFontString(): string {
		return this.fontSize + "px " + this.font;
	}

	/**
	 * Overridable method for calculating text color - useful for elements that want to be colored on different after certain events
	 * @returns a string containg the text color
	 */
	calculateTextColor(): string {
		return this.textColor.toStringRGBA();
	}

	/**
	 * Uses the canvas to calculate the width of the text
	 * @param ctx The rendering context
	 * @returns A number representing the rendered text width
	 */
	protected calculateTextWidth(ctx: CanvasRenderingContext2D): number {
		ctx.font = this.fontSize + "px " + this.font;
		return ctx.measureText(this.text).width;
	}

	setHAlign(align: string): void {
		this.hAlign = align;
	}

	setVAlign(align: string): void {
		this.vAlign = align;
	}

	/**
	 * Calculate the offset of the text - this is used for rendering text with different alignments
	 * @param ctx The rendering context
	 * @returns The offset of the text in a Vec2
	 */
	calculateTextOffset(ctx: CanvasRenderingContext2D): Vec2 {
		let textWidth = this.calculateTextWidth(ctx);

		let offset = new Vec2(0, 0);

		let hDiff = this.size.x - textWidth;
		if(this.hAlign === HAlign.CENTER){
			offset.x = hDiff/2;
		} else if (this.hAlign === HAlign.RIGHT){
			offset.x = hDiff;
		}

		if(this.vAlign === VAlign.TOP){
			ctx.textBaseline = "top";
			offset.y = 0;
		} else if (this.vAlign === VAlign.BOTTOM){
			ctx.textBaseline = "bottom";
			offset.y = this.size.y;
		} else {
			ctx.textBaseline = "middle";
			offset.y = this.size.y/2;
		}

		return offset;
	}

	protected sizeChanged(): void {
		super.sizeChanged();
		this.sizeAssigned = true;
	}

	/**
	 * Automatically sizes the element to the text within it
	 * @param ctx The rendering context
	 */
	protected autoSize(ctx: CanvasRenderingContext2D): void {
		let width = this.calculateTextWidth(ctx);
		let height = this.fontSize;
		this.size.set(width + this.padding.x*2, height + this.padding.y*2);
		this.sizeAssigned = true;
	}

	/**
	 * Initially assigns a size to the UIElement if none is provided
	 * @param ctx The rendering context
	 */
	handleInitialSizing(ctx: CanvasRenderingContext2D): void {
		if(!this.sizeAssigned){
			this.autoSize(ctx);
		}
	}

	/** On the next render, size this element to it's current text using its current font size */
	sizeToText(): void {
		this.sizeAssigned = false;
	}
}

export enum VAlign {
	TOP = "top",
	CENTER = "center",
	BOTTOM = "bottom"
}

export enum HAlign {
	LEFT = "left",
	CENTER = "center",
	RIGHT = "right"
}