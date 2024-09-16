import {YMap} from "../../conversionManagment/yjsEnhancement";
import {Doc} from "yjs";
import {YHandler} from "../yHandler";
import {ReservedKeys} from "../../yWrapper/yWrapper.types";

function fromYjs(yMap: YMap): Promise<Blob> {
    return new Promise( resolve => {
        const subDoc = yMap.get(ReservedKeys.subDoc);
        subDoc.load();

        waitForDoc(subDoc).then(() =>
            resolve(subDoc.getMap("contents").get("blob") as Blob));
    });
}

function waitForDoc(ydoc: Doc): Promise<Doc> {
    return new Promise((resolve, reject) => {
        //	Document already populated
        if (ydoc.share.size > 0) resolve(ydoc);
        //	Resolve on update
        ydoc.once("update", () => resolve(ydoc));
        //	Reject after 10 seconds
        setTimeout(() => reject(), 10000);
    })
}

function toYjs(yMap: YMap, blob: Blob): void {
    const sub_doc = new Doc();
    const sub_map = sub_doc.getMap("contents");

    sub_map.set("blob", blob);
    yMap.set(ReservedKeys.subDoc, sub_doc);
}

function diff(): void {
    throw "Ywrapper Blob plugin: Blob diffing is not supported !"
}

export const blobHandler = new YHandler(Blob, YMap, fromYjs, toYjs, diff, diff);