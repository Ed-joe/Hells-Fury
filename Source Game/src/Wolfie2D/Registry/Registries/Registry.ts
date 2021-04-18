import Map from "../../DataTypes/Map";

export default abstract class Registry<T> extends Map<T>{

    /** Preloads registry data */
    public abstract preload(): void;

    /**
     * Registers an item and preloads any necessary files
     * @param key The key to register this item with
     * @param args Any additional arguments needed for registration
     */
    public abstract registerAndPreloadItem(key: string, ...args: any): void;

    /**
     * Registers an item and preloads any necessary files
     * @param key The key to register this item with
     * @param args Any aditional arguments needed for registration
     */
    public abstract registerItem(key: string, ...args: any): void;
}