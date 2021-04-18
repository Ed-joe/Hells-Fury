import Collection from "./Collection";

/**
 * A LIFO stack with items of type T
 */
export default class Stack<T> implements Collection {
    /** The maximum number of elements in the Stack */
    private MAX_ELEMENTS: number;
    
    /** The internal representation of the stack */
    private stack: Array<T>;
    
    /** The head of the stack */
	private head: number;

    /**
     * Constructs a new stack
     * @param maxElements The maximum size of the stack
     */
    constructor(maxElements: number = 100){
        this.MAX_ELEMENTS = maxElements;
        this.stack = new Array<T>(this.MAX_ELEMENTS);
        this.head = -1;
    }
    
    /**
     * Adds an item to the top of the stack
     * @param item The new item to add to the stack
     */
    push(item: T): void {
        if(this.head + 1 === this.MAX_ELEMENTS){
            throw "Stack full - cannot add element";
        }
        this.head += 1;
        this.stack[this.head] = item;
    }

    /**
     * Removes an item from the top of the stack
     * @returns The item at the top of the stack
     */
    pop(): T {
        if(this.head === -1){
            throw "Stack empty - cannot remove element";
        }
        this.head -= 1;
        return this.stack[this.head + 1];
    }

    /**
     * Returns the element currently at the top of the stack
     * @returns The item at the top of the stack
     */
    peek(): T {
        if(this.head === -1){
            throw "Stack empty - cannot get element";
        }
        return this.stack[this.head];
    }

    /** Returns true if this stack is empty
     * @returns A boolean that represents whether or not the stack is empty
    */
    isEmpty(): boolean {
        return this.head === -1;
    }

    // @implemented
    clear(): void {
        this.forEach((item, index) => delete this.stack[index]);
        this.head = -1;
    }

    /**
     * Returns the number of items currently in the stack
     * @returns The number of items in the stack
     */
    size(): number {
        return this.head + 1;
    }

    // @implemented
    forEach(func: (item: T, index?: number) => void): void{
        let i = 0;
        while(i <= this.head){
            func(this.stack[i], i);
            i += 1;
        }
    }

    /**
     * Converts this stack into a string format
     * @returns A string representing this stack
     */
    toString(): string {
        let retval = "";

        this.forEach( (item, index) => {
            let str = item.toString()
            if(index !== 0){
                str += " -> "
            }
            retval = str + retval;
        });

        return "Top -> " + retval;
    }
}