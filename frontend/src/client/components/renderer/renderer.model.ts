import {auto, signal, TurboModel, TurboYBlock} from "turbodombuilder";

export class RendererModel extends TurboModel {
    public static dataBlockConstructor = TurboYBlock;
    public readonly videoElementsCount: number = 1 as const;

    public isPlaying: boolean = false;

    //TODO @auto({cancelIfUnchanged: false})
    @signal public currentCanvasFill: string | CanvasImageSource;

    @auto({
        setIfUndefined: true,
        cancelIfUnchanged: false,
        preprocessValue: function (value: number) {
            if (!value) value = 0;
            while (value < 0) value += this.videoElementsCount;
            while (value >= this.videoElementsCount) value -= this.videoElementsCount;
            return value;
        }
    }) public set currentIndex(value: number) {}

    public get nextIndex(): number {
        let index = this.currentIndex + 1;
        if (index >= this.videoElementsCount) index -= this.videoElementsCount;
        return index;
    }

    public get previousIndex(): number {
        let index = this.currentIndex - 1;
        if (index < 0) index += this.videoElementsCount;
        return index;
    }
}