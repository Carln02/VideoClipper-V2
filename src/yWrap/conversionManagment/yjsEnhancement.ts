import {Map as YMap, Array as YArray, AbstractType} from "yjs";

declare module "yjs" {
    interface Map<MapType = any> {
        getForced(key: string): any;
        hasForced(key: string): boolean;
        entriesForced(): any[];
    }

    interface Array<T = any> {
        getForced(key: string): any;
        arrayForced(): any[];
    }

    interface AbstractType<EventType = any> {
        parentForced(): AbstractType | null;
        _prelimParent: AbstractType | null;
    }
}

Object.defineProperties(YMap.prototype, {
    getForced: {
        value: function (key: string) {
            return this.doc == null ? this._prelimContent.get(key) : this.get(key);
        }
    },
    hasForced: {
        value: function (key: string) {
            return this.doc == null ? this._prelimContent.has(key) : this.has(key);
        }
    },
    entriesForced: {
        value: function () {
            return this.doc == null ? this._prelimContent : this.entries();
        }
    }
});

Object.defineProperties(YArray.prototype, {
    getForced: {
        value: function (index: number) {
            return this.doc == null ? this._prelimContent[index] : this.get(index);
        }
    },
    arrayForced: {
        value: function () {
            return this.doc == null ? this._prelimContent : this.toArray();
        }
    }
});

Object.defineProperties(AbstractType.prototype, {
    parentForced: {
        value: function () {
            return this.doc == null ? this._prelimParent : this.parent;
        }
    }
});

export {YMap, YArray, AbstractType};