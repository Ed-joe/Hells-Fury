// @ignorePage

/**
 * An interface for all iterable data custom data structures
 */
export default interface Collection {
	/**
	 * Iterates through all of the items in this data structure.
	 * @param func The function to evaluate of every item in the collection
	 */
	forEach(func: Function): void;

	/**
	 * Clears the contents of the data structure
	 */
	clear(): void;
}