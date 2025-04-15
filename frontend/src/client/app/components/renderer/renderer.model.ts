import {YComponentModel} from "../../../../yManagement/yModel/types/yComponentModel";
import {auto} from "turbodombuilder";

export class RendererModel extends YComponentModel {
   public readonly videoElementsCount: number = 1 as const;

   public isPlaying: boolean = false;
   
    private _currentIndex: number = 0;

    @auto({cancelIfUnchanged: false})
    public set currentCanvasFill(value: string | CanvasImageSource) {
        this.fireCallback("canvasFillChanged");
    }

    public get currentIndex(): number {
        return this._currentIndex;
    }

    public set currentIndex(value: number) {
        while (value < 0) value += this.videoElementsCount;
        while (value >= this.videoElementsCount) value -= this.videoElementsCount;
        this._currentIndex = value;
    }

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