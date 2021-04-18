import Map from "../DataTypes/Map";
import Vec2 from "../DataTypes/Vec2";
import GameNode from "../Nodes/GameNode";
import Color from "../Utils/Color";

/**
 * A util class for rendering Debug messages to the canvas.
 */
export default class Debug {

	/** A map of log messages to display on the screen */ 
	private static logMessages: Map<string> = new Map();

	/** An array of game nodes to render debug info for */
	private static nodes: Array<GameNode>;

	/** The rendering context for any debug messages */
	private static debugRenderingContext: CanvasRenderingContext2D;

	/**	The size of the debug canvas */
	private static debugCanvasSize: Vec2;

	/** The rendering color for text */
	private static defaultTextColor: Color = Color.WHITE;

	/**
	 * Add a message to display on the debug screen
	 * @param id A unique ID for this message
	 * @param messages The messages to print to the debug screen
	 */
	static log(id: string, ...messages: any): void {
		// let message = "";
		// for(let i = 0; i < messages.length; i++){
		// 	message += messages[i].toString();
		// }
		// Join all messages with spaces
		let message = messages.map((m: any) => m.toString()).join(" ");
		this.logMessages.add(id, message);
	}

	/**
	 * Deletes a a key from the log and stops it from keeping up space on the screen
	 * @param id The id of the log item to clear
	 */
	static clearLogItem(id: string): void {
		this.logMessages.delete(id);
	}

	/**
	 * Sets the list of nodes to render with the debugger
	 * @param nodes The new list of nodes
	 */
	static setNodes(nodes: Array<GameNode>): void {
		this.nodes = nodes;
	}

	/**
	 * Draws a box at the specified position
	 * @param center The center of the box
	 * @param halfSize The dimensions of the box
	 * @param filled A boolean for whether or not the box is filled
	 * @param color The color of the box to draw
	 */
	static drawBox(center: Vec2, halfSize: Vec2, filled: boolean, color: Color): void {
		let alpha = this.debugRenderingContext.globalAlpha;
		this.debugRenderingContext.globalAlpha = color.a;

		if(filled){
			this.debugRenderingContext.fillStyle = color.toString();
			this.debugRenderingContext.fillRect(center.x - halfSize.x, center.y - halfSize.y, halfSize.x*2, halfSize.y*2);
		} else {
			let lineWidth = 2;
			this.debugRenderingContext.lineWidth = lineWidth;
			this.debugRenderingContext.strokeStyle = color.toString();
			this.debugRenderingContext.strokeRect(center.x - halfSize.x, center.y - halfSize.y, halfSize.x*2, halfSize.y*2);
		}

		this.debugRenderingContext.globalAlpha = alpha;
	}

	/**
	 * Draws a circle at the specified position
	 * @param center The center of the circle
	 * @param radius The dimensions of the box
	 * @param filled A boolean for whether or not the circle is filled
	 * @param color The color of the circle
	 */
	static drawCircle(center: Vec2, radius: number, filled: boolean, color: Color): void {
		let alpha = this.debugRenderingContext.globalAlpha;
		this.debugRenderingContext.globalAlpha = color.a;

		if(filled){
			this.debugRenderingContext.fillStyle = color.toString();
			this.debugRenderingContext.beginPath();
			this.debugRenderingContext.arc(center.x, center.y, radius, 0, 2 * Math.PI);
			this.debugRenderingContext.closePath();
			this.debugRenderingContext.fill();
		} else {
			let lineWidth = 2;
			this.debugRenderingContext.lineWidth = lineWidth;
			this.debugRenderingContext.strokeStyle = color.toString();
			this.debugRenderingContext.beginPath();
			this.debugRenderingContext.arc(center.x, center.y, radius, 0, 2 * Math.PI);
			this.debugRenderingContext.closePath();
			this.debugRenderingContext.stroke();
		}

		this.debugRenderingContext.globalAlpha = alpha;
	}

	/**
	 * Draws a ray at the specified position
	 * @param from The starting position of the ray
	 * @param to The ending position of the ray
	 * @param color The color of the ray
	 */
	static drawRay(from: Vec2, to: Vec2, color: Color): void {
		this.debugRenderingContext.lineWidth = 2;
		this.debugRenderingContext.strokeStyle = color.toString();

		this.debugRenderingContext.beginPath();
		this.debugRenderingContext.moveTo(from.x, from.y);
		this.debugRenderingContext.lineTo(to.x, to.y);
		this.debugRenderingContext.closePath();
		this.debugRenderingContext.stroke();
	}

	/**
	 * Draws a point at the specified position
	 * @param pos The position of the point
	 * @param color The color of the point
	 */
	static drawPoint(pos: Vec2, color: Color): void {
		let pointSize = 6;
		this.debugRenderingContext.fillStyle = color.toString();
		this.debugRenderingContext.fillRect(pos.x - pointSize/2, pos.y - pointSize/2, pointSize, pointSize);
	}

	/**
	 * Sets the default rendering color for text for the debugger
	 * @param color The color to render the text
	 */
	static setDefaultTextColor(color: Color): void {
		this.defaultTextColor = color;
	}

	/**
	 * Performs any necessary setup operations on the Debug canvas
	 * @param canvas The debug canvas
	 * @param width The desired width of the canvas
	 * @param height The desired height of the canvas
	 * @returns The rendering context extracted from the canvas
	 */
	static initializeDebugCanvas(canvas: HTMLCanvasElement, width: number, height: number): CanvasRenderingContext2D {
        canvas.width = width;
		canvas.height = height;
		
		this.debugCanvasSize = new Vec2(width, height);

        this.debugRenderingContext = canvas.getContext("2d");

        return this.debugRenderingContext;
	}

	/** Clears the debug canvas */
	static clearCanvas(): void {
		this.debugRenderingContext.clearRect(0, 0, this.debugCanvasSize.x, this.debugCanvasSize.y);
	}

	/** Renders the text and nodes sent to the Debug system */
	static render(): void {
		this.renderText();
		this.renderNodes();
	}

	/** Renders the text sent to the Debug canvas */
	static renderText(): void {
		let y = 20;
		this.debugRenderingContext.font = "20px Arial";
		this.debugRenderingContext.fillStyle = this.defaultTextColor.toString();

		// Draw all of the text
		this.logMessages.forEach((key: string) => {
			this.debugRenderingContext.fillText(this.logMessages.get(key), 10, y)
			y += 30;	
		});
	}

	/** Renders the nodes registered with the debug canvas */
	static renderNodes(): void {
		if(this.nodes){
			this.nodes.forEach(node => {
				node.debugRender();
			});
		}
	}
}