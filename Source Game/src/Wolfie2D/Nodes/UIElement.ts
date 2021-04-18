import CanvasNode from "./CanvasNode";
import Color from "../Utils/Color";
import Vec2 from "../DataTypes/Vec2";
import Input from "../Input/Input";

/**
 * The representation of a UIElement - the parent class of things like buttons
 */
export default abstract class UIElement extends CanvasNode {
	// Style attributes - TODO - abstract this into a style object/interface
	/** The backgound color */
	backgroundColor: Color;
	/** The border color */
	borderColor: Color;
	/** The border radius */
	borderRadius: number;
	/** The border width */
	borderWidth: number;
	/** The padding */
	padding: Vec2;

	// EventAttributes
	/** The reaction of this UIElement on a click */
	onClick: Function;
	/** The event propagated on click */
	onClickEventId: string;
	/** The reaction to the release of a click */
	onRelease: Function;
	/** The event propagated on the release of a click */
	onReleaseEventId: string;
	/** The reaction when a mouse enters this UIElement */
	onEnter: Function;
	/** The event propagated when a mouse enters this UIElement */
	onEnterEventId: string;
	/** The reaction when a mouse leaves this UIElement */
	onLeave: Function;
	/** The event propogated when a mouse leaves this UIElement */
	onLeaveEventId: string;

	/** Whether or not this UIElement is currently clicked on */
	protected isClicked: boolean;
	/** Whether or not this UIElement is currently hovered over */
	protected isEntered: boolean;

	constructor(position: Vec2){
		super();
		this.position = position;
		
		this.backgroundColor = new Color(0, 0, 0, 0);
		this.borderColor = new Color(0, 0, 0, 0);
		this.borderRadius = 5;
		this.borderWidth = 1;
		this.padding = Vec2.ZERO;

		this.onClick = null;
		this.onClickEventId = null;
		this.onRelease = null;
		this.onReleaseEventId = null;

		this.onEnter = null;
		this.onEnterEventId = null;
		this.onLeave = null;
		this.onLeaveEventId = null;

		this.isClicked = false;
		this.isEntered = false;
	}

	// @deprecated
	setBackgroundColor(color: Color): void {
		this.backgroundColor = color;
	}

	// @deprecated
	setPadding(padding: Vec2): void {
		this.padding.copy(padding);
	}

	update(deltaT: number): void {
		super.update(deltaT);

		// See of this object was just clicked
		if(Input.isMouseJustPressed()){
			let clickPos = Input.getMousePressPosition();
			if(this.contains(clickPos.x, clickPos.y) && this.visible && !this.layer.isHidden()){
				this.isClicked = true;

				if(this.onClick !== null){
					this.onClick();
				}
				if(this.onClickEventId !== null){
					let data = {};
					this.emitter.fireEvent(this.onClickEventId, data);
				}
			}
		}

		// If the mouse wasn't just pressed, then we definitely weren't clicked
		if(!Input.isMousePressed()){
			if(this.isClicked){
				this.isClicked = false;
			}
		}

		// Check if the mouse is hovering over this element
		let mousePos = Input.getMousePosition();
		if(mousePos && this.contains(mousePos.x, mousePos.y)){
			this.isEntered = true;

			if(this.onEnter !== null){
				this.onEnter();
			}
			if(this.onEnterEventId !== null){
				let data = {};
				this.emitter.fireEvent(this.onEnterEventId, data);
			}

		} else if(this.isEntered) {
			this.isEntered = false;

			if(this.onLeave !== null){
				this.onLeave();
			}
			if(this.onLeaveEventId !== null){
				let data = {};
				this.emitter.fireEvent(this.onLeaveEventId, data);
			}
		} else if(this.isClicked) {
			// If mouse is dragged off of element while down, it is not clicked anymore
			this.isClicked = false;
		}
	}

	/**
	 * Overridable method for calculating background color - useful for elements that want to be colored on different after certain events
	 * @returns The background color of the UIElement
	 */
	calculateBackgroundColor(): Color {
		return this.backgroundColor;
	}

	/**
	 * Overridable method for calculating border color - useful for elements that want to be colored on different after certain events
	 * @returns The border color of the UIElement
	 */
	calculateBorderColor(): Color {
		return this.borderColor;
	}
}