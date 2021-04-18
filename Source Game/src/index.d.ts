export {};

/*
	This file is EXTREMELY important. DO NOT modify it unless you know what you're doing.
	Modifications of any built in JavaScript types can be done here.

	In TypeScript, in order to expand the prototype for CanvasRenderingContext to include
	rounded rectangles, we have to first add those functions to an interface of its type.
	Later on, when the game is initialized, the functions are added to the prototype.
	Without this file, that second step would NOT work, as typescript would not recognize
	those functions as existing on the object.

	This strategy is very odd, because it isn't necessary in JavaScript, and it isn't
	an issue in Java.
*/
declare global {
	interface CanvasRenderingContext2D {
		roundedRect(x: number, y: number, w: number, h: number, r: number): void
		strokeRoundedRect(x: number, y: number, w: number, h: number, r: number): void
		fillRoundedRect(x: number, y: number, w: number, h: number, r: number): void
	}
}