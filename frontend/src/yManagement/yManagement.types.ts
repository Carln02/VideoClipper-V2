import {Map as YMap, Array as YArray, AbstractType as YAbstractType, Text as YText, Doc as YDoc, YMapEvent, YArrayEvent, YEvent} from "yjs";
import {TurboCustomProperties, TurboModel, TurboView} from "turbodombuilder";

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

export type YDocumentProperties<
    ViewType extends TurboView = TurboView<any, any>,
    DataType extends object = object,
    ModelType extends TurboModel<DataType> = TurboModel
>  = TurboCustomProperties<ViewType, DataType, ModelType> & {
    document: YDoc
};

export {YMap, YArray, YAbstractType, YText, YDoc, YEvent, YMapEvent, YArrayEvent};