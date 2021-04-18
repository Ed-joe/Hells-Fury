import Collection from "./Collection";

/**
 * A doubly linked list
 */
export default class List<T> implements Collection {

    private head: ListItem<T>;
    private tail: ListItem<T>;
    private _size: number;

    constructor(){
        this.head = null;
        this.tail = null;
        this._size = 0;
    }

    get size(): number {
        return this._size;
    }

    add(value: T){
        if(this._size === 0){
            // There were no items in the list previously, so head and tail are the same
            this.head = new ListItem(value, null, null);
            this.tail = this.head;
        } else {
            this.tail.next = new ListItem(value, this.tail, null);
            this.tail = this.tail.next;
        }

        // Increment the size
        this._size += 1;
    }

    forEach(func: Function): void {
        let p = this.head;

        while(p !== null){
            func(p.value);
            p = p.next;
        }
    }

    clear(): void {
        this.head = null
        this.tail = null
        this._size = 0;
    }

}

class ListItem<T> {
    value: T;
    next: ListItem<T>;
    prev: ListItem<T>;

    constructor(value: T, next: ListItem<T>, prev: ListItem<T>){
        this.value = value;
        this.next = next;
        this.prev = prev;
    }
}