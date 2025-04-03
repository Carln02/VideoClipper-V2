import {Coordinate, Point, TurboDragEvent, TurboEventName, TurboWheelEvent} from "turbodombuilder";
import {Canvas} from "../../screens/canvas/canvas";

/**
 * @description Manages the navigation (panning and zooming) of a canvas
 */
export class NavigationManager {
    //The canvas it is linked to
    private canvas: Canvas;

    //Translation and scale
    private _translation: Point = new Point();
    private _scale: number = 1;

    //Const fields representing the zoom intensity for different input devices
    private readonly zoomMouseIntensity = 0.1 as const;
    private readonly zoomTrackpadIntensity = 0.05 as const;
    private readonly zoomTouchIntensity = 0.005 as const;

    //Zooming bounds
    private readonly maxScale = 20 as const;
    private readonly minScale = 0.1 as const;

    private willChangeTimeout: NodeJS.Timeout = null;

    constructor(canvas: Canvas) {
        this.canvas = canvas;
        //Init canvas position to the center of the screen
        this.translation = new Point(window.innerWidth / 2, window.innerHeight / 2);
        this.initEvents();
    }

    private initEvents() {
        //Listen for wheel events to accordingly zoom or pan
        document.addEventListener(TurboEventName.trackpadScroll, (e: TurboWheelEvent) => this.pan(e));
        document.addEventListener(TurboEventName.trackpadPinch, (e: TurboWheelEvent) => this.zoom(e, true));
        document.addEventListener(TurboEventName.mouseWheel, (e: TurboWheelEvent) => this.zoom(e));
    }

    // Translation and scale manipulation

    /**
     * @description The canvas's current scale.
     */
    public get scale() {
        return this._scale;
    }

    private set scale(value: number) {
        //Make sure the value is between the bounds. For some reason, removing the 0.01 offset on the bounds will
        // render the scaling stuck to one end when it is reached by the user.
        if (value > this.maxScale) this._scale = this.maxScale - 0.01;
        else if (value < this.minScale) this._scale = this.minScale + 0.01;
        else this._scale = value;
        //Transform the canvas accordingly
        this.canvas.transform(this.translation, this.scale);
    }

    /**
     * @description The canvas's current translation
     * @private
     */
    public get translation(): Point {
        return this._translation;
    }

    private set translation(value: Point) {
        this._translation = value;
        //Transform the canvas accordingly
        this.canvas.transform(this.translation, this.scale);
    }

    /**
     * @description Translate the canvas by the given delta values (will increment the previous translation
     * by the given values).
     * @param delta
     * @private
     */
    private translate(delta: {x: number, y: number}) {
        this.translation = this.translation.add(delta.x, delta.y);
    }

    //Pan and zoom

    /**
     * @description Pans the canvas
     * @param e
     */
    public pan(e: TurboDragEvent | TurboWheelEvent) {
        this.fireWillChangeTimeout();

        //Get panning value according to the wheel event provided
        let pos: Point;
        if (e instanceof TurboWheelEvent) pos = new Point(-e.delta.x, -e.delta.y);
        else {
            //Unscale panning value
            pos = e.scaledDeltaPosition.mul(this.scale);
        }

        //Translate by panning value
        this.translate(pos);
    }

    //TODO maybe also consider pointer location as zoom origin (for PC events)
    /**
     * @description Zooms the canvas
     * @param e
     * @param isTrackpad
     */
    public zoom(e: TurboWheelEvent | TurboDragEvent, isTrackpad: boolean = false) {
        this.fireWillChangeTimeout();

        //Save old scale value
        const oldScale: number = this.scale;
        //Init zoom origin to the center of the screen
        let zoomOrigin = new Point(window.innerWidth / 2, window.innerHeight / 2).sub(this.translation);

        //Touch Event
        if (e instanceof TurboDragEvent) {
            //Get arrays of positions and previous positions
            const positionsArray = e.scaledPositions.valuesArray();
            const previousPositionsArray = e.scaledPreviousPositions.valuesArray();

            //Set the zoom origin to be the center of the touch points
            zoomOrigin = Point.midPoint(...positionsArray).mul(this.scale);

            //Increment scaling accordingly (came up with this through trial and error - it feels pretty natural)
            this.scale += this.scale * this.scale * (Point.dist(positionsArray[0], positionsArray[1]) -
                Point.dist(previousPositionsArray[0], previousPositionsArray[1])) * this.zoomTouchIntensity;
        }

        //Trackpad
        else if (isTrackpad) this.scale -= this.scale * e.delta.y * this.zoomTrackpadIntensity;

        //Mouse Wheel
        else this.scale -= this.scale * (e.delta.y > 0 ? 1 : -1) * this.zoomMouseIntensity;

        //Translate the viewport to make the zooming origin from the center of the screen
        this.translate(zoomOrigin.mul(1 - this.scale / oldScale));
    }

    private fireWillChangeTimeout() {
        if (this.willChangeTimeout) clearTimeout(this.willChangeTimeout);
        this.willChangeTimeout = setTimeout(() => {
            this.canvas.setStyle("willChange", "");
            requestAnimationFrame(() => this.canvas.setStyle("willChange", "transform"));
        }, 200);
    }

    /**
     * @description Offset a given screen position by the canvas's translation.
     * @param {Point} screenPosition
     */
    public computePositionRelativeToCanvas(screenPosition: Point) {
        return screenPosition?.sub(this.translation as Coordinate).div(this.scale);
    }
}
