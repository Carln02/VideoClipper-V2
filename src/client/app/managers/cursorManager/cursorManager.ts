import {Cursor} from "./cursorManager.types";

/**
 * @description Manages changing the cursor for the whole application
 */
export class CursorManager {
    //Singleton
    private static _instance: CursorManager | null = null;

    private readonly html: HTMLElement;
    private _cursor: Cursor;

    constructor() {
        //Cancel construction if exists already
        if (CursorManager.instance) return CursorManager.instance;
        CursorManager.instance = this;

        this.html = document.documentElement;
    }

    /**
     * @description The singleton instance.
     */
    public static get instance() {
        return this._instance;
    }

    private static set instance(value: CursorManager) {
        this._instance = value;
    }

    /**
     * @description The application's cursor state
     */
    public get cursor() {
        return this._cursor;
    }

    public set cursor(value: Cursor) {
        this._cursor = value;
        this.html.style.cursor = value;
    }
}