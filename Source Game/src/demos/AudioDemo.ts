import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import { GameEventType } from "../Wolfie2D/Events/GameEventType";
import Input from "../Wolfie2D/Input/Input";
import Label from "../Wolfie2D/Nodes/UIElements/Label";
import Slider from "../Wolfie2D/Nodes/UIElements/Slider";
import { UIElementType } from "../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../Wolfie2D/Scene/Scene";
import AudioManager, { AudioChannelType } from "../Wolfie2D/Sound/AudioManager";
import Color from "../Wolfie2D/Utils/Color";

export default class Test extends Scene {
    loadScene(){
        this.load.audio("song", "demo_assets/sounds/title.mp3");
        this.load.audio("sfx", "demo_assets/sounds/jump.wav");
    }

    startScene(){
        this.emitter.fireEvent(GameEventType.PLAY_MUSIC, {key: "song", loop: true, holdReference: true});

        this.addLayer("Main");

        // Initialize value to 1 (music is at max)
        let slider = <Slider>this.add.uiElement(UIElementType.SLIDER, "Main", {position: new Vec2(600, 600), value: 1});
        
        // UI Stuff
        slider.size = new Vec2(200, 50);
        slider.nibSize = new Vec2(30, 30);
        slider.nibColor = Color.WHITE;
        slider.sliderColor = Color.WHITE;

        slider.onValueChange = (value: number) => {
            // Use a non-linear value->volume function, since sound is wack
            AudioManager.setVolume(AudioChannelType.MUSIC, value*value);
        }

        // Initialize value to 1 (music is at max)
        let sfxslider = <Slider>this.add.uiElement(UIElementType.SLIDER, "Main", {position: new Vec2(600, 700), value: 1});

        // UI Stuff
        sfxslider.size = new Vec2(200, 50);
        sfxslider.nibSize = new Vec2(30, 30);
        sfxslider.nibColor = Color.WHITE;
        sfxslider.sliderColor = Color.WHITE;

        sfxslider.onValueChange = (value: number) => {
            // Use a non-linear value->volume function, since sound is wack
            AudioManager.setVolume(AudioChannelType.SFX, value*value);
        }

        (this.add.uiElement(UIElementType.LABEL, "Main", {position: new Vec2(600, 100), text: "1 - Play a sound"}) as Label).textColor = Color.WHITE;
        (this.add.uiElement(UIElementType.LABEL, "Main", {position: new Vec2(600, 200), text: "2 - Mute music"}) as Label).textColor = Color.WHITE;
        (this.add.uiElement(UIElementType.LABEL, "Main", {position: new Vec2(600, 300), text: "3 - Unmute music"}) as Label).textColor = Color.WHITE;
        (this.add.uiElement(UIElementType.LABEL, "Main", {position: new Vec2(600, 400), text: "4 - Fade out music"}) as Label).textColor = Color.WHITE;
    }

    updateScene(deltaT: number){
        if(Input.isKeyJustPressed("1")){
            this.emitter.fireEvent(GameEventType.PLAY_SFX, {key: "sfx", loop: false, holdReference: false});
        } else if(Input.isKeyJustPressed("2")){
            this.emitter.fireEvent(GameEventType.MUTE_CHANNEL, {channel: AudioChannelType.MUSIC});
        } else if(Input.isKeyJustPressed("3")){
            this.emitter.fireEvent(GameEventType.UNMUTE_CHANNEL, {channel: AudioChannelType.MUSIC});
        } else if(Input.isKeyJustPressed("4")){
            // https://developer.mozilla.org/en-US/docs/Web/API/AudioParam
            const am = AudioManager.getInstance();
            const ctx = am.getAudioContext();
            const gainNode = am.getChannelGainNode(AudioChannelType.MUSIC);
            gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
        }
    }
}