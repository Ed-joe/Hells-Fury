import Registry from "../../Wolfie2D/Registry/Registries/Registry";
import WeaponType from "../GameSystems/items/WeaponTypes/WeaponType";

export default class WeaponTypeRegistry extends Registry<WeaponType> {
    
    public preload(): void {}

    // We don't need this for this assignment
    public registerAndPreloadItem(key: string): void {}

    public registerItem(key: string, type: WeaponType): void {
        this.add(key, type);
    }
}