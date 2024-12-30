import {Map as YMap, Array as YArray, AbstractType as YAbstractType, Text as YText, Doc as YDoc, YMapEvent, YArrayEvent, YEvent} from "yjs";

declare module "yjs" {
    interface Map<MapType = any> {
    }

    interface Array<T = any> {
    }

    interface AbstractType<EventType = any> {
    }

    interface YEvent<T = any, EventType = any> {}

    interface YMapEvent<T = any, EventType = any> {}

    interface YArrayEvent<T = any, EventType = any> {}
}

export {YMap, YArray, YAbstractType, YText, YDoc, YEvent, YMapEvent, YArrayEvent};