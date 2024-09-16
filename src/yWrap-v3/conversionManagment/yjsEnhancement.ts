import {Map as YMap, Array as YArray, AbstractType as YAbstractType, Text as YText, YMapEvent, YArrayEvent, Doc as YDoc} from "yjs";

declare module "yjs" {
    interface Map<MapType = any> extends AbstractType<YMapEvent<MapType>> {
        getForced(key: string): any;
        hasForced(key: string): boolean;
        entriesForced(): any[];
    }

    interface Array<T = any> extends AbstractType<YArrayEvent<T>> {
        getForced(key: string): any;
        arrayForced(): any[];
    }

    interface AbstractType<EventType = any> {
        parentForced(): AbstractType | null;
        _prelimParent: AbstractType | null;
    }
}

// Object.defineProperties(YMap.prototype, {
//     getForced: {
//         value: function (key: string) {
//             return this.doc == null ? this._prelimContent.get(key) : this.get(key);
//         }
//     },
//     hasForced: {
//         value: function (key: string) {
//             return this.doc == null ? this._prelimContent.has(key) : this.has(key);
//         }
//     },
//     entriesForced: {
//         value: function () {
//             return this.doc == null ? this._prelimContent : this.entries();
//         }
//     }
// });
//
// Object.defineProperties(YArray.prototype, {
//     getForced: {
//         value: function (index: number) {
//             return this.doc == null ? this._prelimContent[index] : this.get(index);
//         }
//     },
//     arrayForced: {
//         value: function () {
//             return this.doc == null ? this._prelimContent : this.toArray();
//         }
//     }
// });
//
// Object.defineProperties(YAbstractType.prototype, {
//     parentForced: {
//         value: function () {
//             return this.doc == null ? this._prelimParent : this.parent;
//         }
//     }
// });

export {YMap, YArray, YAbstractType, YText, YDoc};