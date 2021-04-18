/** Some utility functions for sorting arrays */
export default class SortingUtils {
	/**
	 * An implementation of insertion sort.
	 * In game engines, this is particularly useful to sort node positions because of temporal coherence - 
	 * the idea that nodes are almost in the same place as last frame, and thus, in a frame-to-frame comparison,
	 * nodes essentially do not change position.
	 * This means we have a nearly sorted array of nodes if we keep track of this,
	 * so something like insertion sort actually becomes essentailly O(n),
	 * as it performs very well on nearly sorted arrays.
	 * @param arr The array to sort in place
	 * @param comparator Compares element a and b in the array. Returns -1 if a < b, 0 if a = b, and 1 if a > b
	 */
	static insertionSort<T>(arr: Array<T>, comparator: (a: T, b: T) => number): void {
		let i = 1;
		let j;
		while(i < arr.length){
			j = i;
			while(j > 0 && comparator(arr[j-1], arr[j]) > 0){
				SortingUtils.swap(arr, j-1, j);
			}
			i += 1;
		}
	}

	/**
	 * Swaps two elements in the provided array
	 * @param arr The array to perform the swap on in place
	 * @param i The first index
	 * @param j The second index
	 */
	static swap<T>(arr: Array<T>, i: number, j: number): void {
		let temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}
}