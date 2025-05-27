import {ContextEntry, ContextView} from "./contextManager.types";
import {Delegate} from "turbodombuilder";

export class ContextManager {
    private _view: ContextView = ContextView.home;
    private _context: Map<number, Element[]>;

    public readonly onContextChange: Delegate<(entry: ContextEntry) => void>;

    public constructor() {
        this.context = new Map<number, Element[]>();
        this.onContextChange = new Delegate<(entry: ContextEntry) => void>();
    }

    public get view() {
        return this._view;
    }

    public set view(value: ContextView) {
        this._view = value;
    }

    public get context() {
        return this._context;
    }

    private set context(value: Map<number, Element[]>) {
        this._context = value;
    }

    public clearContext(level: number = 1) {
        this.context.forEach((value, key) => {
            if (key >= level) this.context.set(key, null);
            value?.forEach(entry => {
                if ("select" in entry && typeof entry.select == "function") entry.select(false);
                if ("selected" in entry) entry.selected = false;
                this.onContextChange.fire({element: entry, level: key, changed: "removed"});
            });
        });
    }

    public setContext(element: Element, level: number = 1, select: boolean = false): number {
        if (!element) return -1;
        const levelEntry = this.context.get(level);
        if (levelEntry && levelEntry.length == 1 && levelEntry[0] == element) return 0;

        this.clearContext(level);
        this.context.set(level, [element]);

        if (select) {
            if ("select" in element && typeof element.select == "function") element.select(true);
            if ("selected" in element) element.selected = true;
        }

        this.onContextChange.fire({element: element, level: level, changed: "added"});
        return 0;
    }

    public addContext(element: Element, level: number = 1, select: boolean = false): number {
        if (!element) return -1;
        const levelEntry = this.context.get(level);

        if (!levelEntry) this.context.set(level, [element]);
        else if (levelEntry.includes(element)) return levelEntry.indexOf(element);
        else levelEntry.push(element);

        this.clearContext(level + 1);
        if (select) {
            if ("select" in element && typeof element.select == "function") element.select(true);
            if ("selected" in element) element.selected = true;
        }

        this.onContextChange.fire({element: element, level: level, changed: "added"});
        return levelEntry.length - 1;
    }

    public removeContext(element: Element, level: number = 1): boolean {
        if (!element) return false;
        this.clearContext(level + 1);
        const levelEntry = this.context.get(level);
        if (!levelEntry) return false;
        const index = levelEntry.indexOf(element);
        if (index < 0) return false;
        levelEntry.splice(index, 1);
        if ("select" in element && typeof element.select == "function") element.select(false);
        this.onContextChange.fire({element: element, level: level, changed: "removed"});
        return true;
    }

    public getContext(level: number = 1) {
        return this.context.get(level) || [];
    }

    public getOfType<Type extends Element>(type: new (...args: any[]) => Type): Type | null {
        for (const [, entries] of this.context.entries()) {
            if (!entries) continue;
            const entry = entries.find(entry => entry instanceof type);
            if (entry) return entry as Type;
        }
        return null;
    }

    public getAllOfType<Type extends Element>(type: new (...args: any[]) => Type): Type[] {
        const elements: Type[] = [];
        for (const [, entries] of this.context.entries()) {
            if (!entries) continue;
            elements.push(...entries.filter(entry => entry instanceof type) as Type[]);
        }
        return elements;
    }
}