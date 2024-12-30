import {YDoc} from "./yManagement.types";

export class YDocument {
    protected readonly document: YDoc;

    public constructor(document: YDoc) {
        this.document = document;
    }
}