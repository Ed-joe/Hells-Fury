import Registry from "../../Wolfie2D/Registry/Registries/Registry";
import ResourceManager from "../../Wolfie2D/ResourceManager/ResourceManager";
import SemiAutoGun from "../GameSystems/items/WeaponTypes/SemiAutoGun";
import Slice from "../GameSystems/items/WeaponTypes/Slice";
import WeaponType from "../GameSystems/items/WeaponTypes/WeaponType";

export default class WeaponTemplateRegistry extends Registry<WeaponConstructor> {
    
    public preload(): void {
        const rm = ResourceManager.getInstance();

        // Load sprites
        rm.image("pistol", "hw3_assets/sprites/pistol.png");
        rm.image("knife", "hw3_assets/sprites/knife.png");
        rm.image("excalibur", "hw3_assets/sprites/laser.png")

        // Load spritesheets
        rm.spritesheet("slice", "hw3_assets/spritesheets/slice.json");

        // Register default types
        this.registerItem("slice", Slice);

        this.registerItem("semiAutoGun", SemiAutoGun);
    }

    // We don't need this for this assignment
    public registerAndPreloadItem(key: string): void {}

    public registerItem(key: string, constr: WeaponConstructor): void {
        this.add(key, constr);
    }
}

type WeaponConstructor = new (...args: any) => WeaponType;