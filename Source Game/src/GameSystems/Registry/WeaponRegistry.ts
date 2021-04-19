import Registry from "../../Wolfie2D/Registry/Registries/Registry";
import ResourceManager from "../../Wolfie2D/ResourceManager/ResourceManager";
import WeaponType from "../WeaponTypes/WeaponType";
import Punch from "../WeaponTypes/Punch";

export default class WeaponRegistry extends Registry<WeaponConstructor> {
    public preload(): void {
        const rm = ResourceManager.getInstance();

        // load spritesheets
        // TODO PROJECT - import punch spritesheet
        rm.spritesheet("punch", "INSERTPATHHERE");

        this.registerItem("punch", Punch);
    }

    public registerAndPreloadItem(key: string): void {}

    public registerItem(key: string, constr: WeaponConstructor): void {
        this.add(key, constr);
    }
}

type WeaponConstructor = new (...args: any) => WeaponType;