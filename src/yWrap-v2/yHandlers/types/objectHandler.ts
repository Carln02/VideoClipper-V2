import {YHandler} from "../yHandler";
import {YConverterCallback} from "../yHandlers.types";
import {YMap} from "../../conversionManagment/yjsEnhancement";
import {ReservedKeys} from "../../yWrapper/yWrapper.types";

function fromYjs(yValue: YMap): object {
    const result = {};

    for (const [key, value] of yValue.entriesForced())
        if (!(Object.values(ReservedKeys) as string[]).includes(key))
            result[key] = value;

    return result;
}

function toYjs(yValue: YMap, object: object, convert_to_yjs: YConverterCallback): void {
    for (const key in object)
        if (!(Object.values(ReservedKeys) as string[]).includes(key))
            yValue.set(key, convert_to_yjs(object[key], key, yValue));
}

function diffFromYjs(yValue: YMap, oldObject: object): void {
    const currentKeys = Object.keys(oldObject);
    const remoteKeys = [...yValue.keys()].filter(key => !(Object.values(ReservedKeys) as string[]).includes(key));
    const deletedKeys = currentKeys.filter(key => !remoteKeys.includes(key));

    for (const key of deletedKeys)
        delete oldObject[key];

    for (const key of remoteKeys)
        if (oldObject[key] !== yValue.get(key))
            oldObject[key] = yValue.get(key);
}

function diffToYjs(yValue: YMap, newObject: object): void {
    const currentKeys = Object.keys(newObject);
    const remoteKeys = [...yValue.keys()].filter(key => !(Object.values(ReservedKeys) as string[]).includes(key));
    const deletedKeys = remoteKeys.filter(key => !currentKeys.includes(key));

    for (const key of deletedKeys)
        yValue.delete(key);

    for (const key of currentKeys)
        if (yValue.get(key) !== newObject[key])
            yValue.set(key, newObject[key]);
}

export const objectHandler = new YHandler(Object, YMap, fromYjs, toYjs, diffFromYjs, diffToYjs);