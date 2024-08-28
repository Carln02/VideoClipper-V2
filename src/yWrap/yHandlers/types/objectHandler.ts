import {YHandler} from "../yHandler";
import {YConverterCallback} from "../yHandlers.types";
import {YMap} from "../../conversionManagment/yjsEnhancement";
import {ReservedKeys} from "../../yWrapper/yWrapper.types";

function fromYjs(yMap: YMap): object {
    const result = {};

    for (const [key, value] of yMap.entriesForced())
        if (!(Object.values(ReservedKeys) as string[]).includes(key))
            result[key] = value;

    return result;
}

function toYjs(yMap: YMap, object: object, convert_to_yjs: YConverterCallback): void {
    for (const key in object)
        if (!(Object.values(ReservedKeys) as string[]).includes(key))
            yMap.set(key, convert_to_yjs(object[key], key, yMap));
}

function diffFromYjs(yMap: YMap, oldObject: object): void {
    const currentKeys = Object.keys(oldObject);
    const remoteKeys = [...yMap.keys()].filter(key => !(Object.values(ReservedKeys) as string[]).includes(key));
    const deletedKeys = currentKeys.filter(key => !remoteKeys.includes(key));

    for (const key of deletedKeys)
        delete oldObject[key];

    for (const key of remoteKeys)
        if (oldObject[key] !== yMap.get(key))
            oldObject[key] = yMap.get(key);
}

function diffToYjs(yMap: YMap, newObject: object): void {
    const currentKeys = Object.keys(newObject);
    const remoteKeys = [...yMap.keys()].filter(key => !(Object.values(ReservedKeys) as string[]).includes(key));
    const deletedKeys = remoteKeys.filter(key => !currentKeys.includes(key));

    for (const key of deletedKeys)
        yMap.delete(key);

    for (const key of currentKeys)
        if (yMap.get(key) !== newObject[key])
            yMap.set(key, newObject[key]);
}

export const objectHandler = new YHandler(Object, fromYjs, toYjs, diffFromYjs, diffToYjs);