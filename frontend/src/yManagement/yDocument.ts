import {YDoc, YDocumentProperties} from "./yManagement.types";
import {TurboElement, TurboModel, TurboView} from "turbodombuilder";

export class YDocument<
    ViewType extends TurboView = TurboView<any, any>,
    DataType extends object = object,
    ModelType extends TurboModel<DataType> = TurboModel
> extends TurboElement<ViewType, DataType, ModelType> {
    protected readonly document: YDoc;

    public constructor(properties: YDocumentProperties<ViewType, DataType, ModelType>) {
        super(properties);
        this.document = properties.document;
    }
}