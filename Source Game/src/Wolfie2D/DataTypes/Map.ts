import Collection from "./Collection";

/**
 * Associates strings with elements of type T
 */
export default class Map<T> implements Collection {
	private map: Record<string, T>;

	/** Creates a new map */
	constructor(){
		this.map = {};
	}

	/**
	 * Adds a value T stored at a key.
	 * @param key The key of the item to be stored
	 * @param value The item to be stored
	 */
	add(key: string, value: T): void {
		this.map[key] = value;
	}

	/**
	 * Get the value associated with a key.
	 * @param key The key of the item
	 * @returns The item at the key or undefined
	 */
	get(key: string): T {
		return this.map[key];
	}

	/**
	 * An alias of add. Sets the value stored at key to the new specified value
	 * @param key The key of the item to be stored
	 * @param value The item to be stored
	 */
	set(key: string, value: T): void {
		this.add(key, value);
	}

	/**
	 * Returns true if there is a value stored at the specified key, false otherwise.
	 * @param key The key to check
	 * @returns A boolean representing whether or not there is an item at the given key.
	 */
	has(key: string): boolean {
		return this.map[key] !== undefined;
	}

	/**
	 * Returns an array of all of the keys in this map.
	 * @returns An array containing all keys in the map.
	 */
	keys(): Array<string> {
		return Object.keys(this.map);
	}
	
	// @implemented
	forEach(func: (key: string) => void): void {
		Object.keys(this.map).forEach(key => func(key));
	}

	/**
	 * Deletes an item associated with a key
	 * @param key The key at which to delete an item
	 */
	delete(key: string): void {
		delete this.map[key];
	}

	// @implemented
	clear(): void {
		this.forEach(key => delete this.map[key]);
	}

	/**
	 * Converts this map to a string representation.
	 * @returns The string representation of this map.
	 */
	toString(): string {
		let str = "";

		this.forEach((key) => str += key + " -> " + this.get(key).toString() + "\n");

		return str;
	}
}