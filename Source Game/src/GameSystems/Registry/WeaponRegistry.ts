import Registry from "../../Wolfie2D/Registry/Registries/Registry";
import ResourceManager from "../../Wolfie2D/ResourceManager/ResourceManager";
import WeaponType from "../WeaponTypes/WeaponType";
import Punch from "../WeaponTypes/Punch";
import GluttonySlam from "../WeaponTypes/GluttonySlam";
import WrathSlice from "../WeaponTypes/WrathSlice";

export default class WeaponRegistry extends Registry<WeaponConstructor> {
    public preload(): void {
        const rm = ResourceManager.getInstance();

        this.registerItem("fist1", Punch);
        this.registerItem("fist2", Punch);
        this.registerItem("fist3", Punch);
        
        this.registerItem("slam", GluttonySlam);

        this.registerItem("slice", WrathSlice);
    }

    public registerAndPreloadItem(key: string): void {}

    public registerItem(key: string, constr: WeaponConstructor): void {
        this.add(key, constr);
    }
}

type WeaponConstructor = new (...args: any) => WeaponType;