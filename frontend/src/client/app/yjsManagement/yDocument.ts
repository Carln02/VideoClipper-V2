import {YDoc} from "../../../yProxy";

export class YDocument {
    protected readonly document: YDoc;

    public constructor(document: YDoc) {
        this.document = document;
    }
}