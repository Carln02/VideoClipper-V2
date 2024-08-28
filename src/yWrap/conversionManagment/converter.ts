import {makeYWrapProxy} from "../yWrapper/proxy";
import {YMap} from "./yjsEnhancement";
import {YPrimitive, YValue, YWrappedValue} from "./conversionManagement.types";
import {AbstractType} from "yjs";
import {config} from "../config";
import {YHandlerRegistry} from "../yHandlers/yHandlerRegistry";
import {ReservedKeys, YWrappedInfo, YWrappedObject} from "../yWrapper/yWrapper.types";

//	Terminology
//
//	yvalue:		any yjs value (or a primitive value)
//	ymap:		specifically a yjs map
//
//	jvalue:		any javascript value
//	jobject:	specifically a javascript object
//
//	wrapped:	ywrapped object (primitives are never wrapped)

//Populate specific type yHandlers
const registry = new YHandlerRegistry(...config.handlers);

//Use a weak map so unused elements can be garbage collected
const yMapCache: WeakMap<YMap, YWrappedObject> = new WeakMap();

/**
 * @description Apply changes from Yjs to the local JS object.
 * @param info
 */
export function diffFromYjs(info: YWrappedInfo): void {
    if (!info) return;
    registry.getHandler(info.rawObject).diffFromYjs(info.yMap, info.rawObject);
}

/**
 * @description Apply changes from the local JS object to Yjs.
 * @param info
 */
export function diffToYjs(info: YWrappedInfo): void {
    if (!info) return;
    info.yMap.doc.transact(
        () => registry.getHandler(info.rawObject).diffToYjs(info.yMap, info.rawObject),
        info.yMap.doc.clientID
    );
    info.batchTimer = null;
}

//Non-recursively convert a yjs value to a ywrapped value
export function yjsToWrapped(yValue: YValue, ownProperty: boolean = true): YWrappedValue {
    if (yValue instanceof AbstractType) {
        if (yValue instanceof YMap) return yMapToWrapped(yValue);
        throw `Trying to convert raw ${(yValue as object).constructor.name}, idk what happened here`;
    }

    if ((yValue as unknown) instanceof Object && ownProperty)
        console.warn(`Accessing raw ${yValue.constructor.name}, this is very suspicious`);

    //Else, simply return the raw (primitive) value
    return yValue;
}

/**
 * @description Convert a yMap to a YWrapped instance (or retrieved its cached value).
 * @param yMap
 */
export function yMapToWrapped(yMap: YMap): YWrappedObject {
    if (!yMap) return null;

    //Don't recreate object if cached
    if (yMapCache.has(yMap)) return yMapCache.get(yMap);

    //Retrieve datatype
    const dataType = yMap.getForced(ReservedKeys.dataType);

    //Throw error if handler doesn't exist
    if (!registry.getHandlerByType(dataType))
        throw `Unable to handle type ${dataType}, did you forget to load a plugin ?`;

    //Else, well, create it...
    const jObject = registry.getHandlerByType(dataType).fromYjs(yMap);

    //Find YWrap parent
    let parent: any = yMap.parentForced();
    while (parent != null && !parent.hasForced?.(ReservedKeys.dataType)) parent = parent.parentForced();

    //Wrap
    const wrapped = makeYWrapProxy(yMap, jObject, parent);

    //Cache and return
    yMapCache.set(yMap, wrapped);
    return wrapped;
}

/**
 * @description Get the wrapped instance of a yMap if it exists.
 * @param yMap
 */
export function yMapToWrappedIfExists(yMap: YMap): YWrappedObject {
    return yMapCache.get(yMap);
}

/**
 * @description Recursively convert a javascript value to its backing yjs structure.
 */
export function javascriptToYjs(jValue: unknown, name: string, parent: YMap): YValue {
    //If not object --> simply return the raw (primitive) value
    if (!(jValue instanceof Object)) return jValue as YPrimitive;

    //Else --> convert it
    const handler = registry.getHandler(jValue);
    if (!handler) throw `Unable to handle type ${handler.name}, did you forget to load a plugin ?`;

    //No caching here because we always want a fresh YMap
    const yMap = new YMap();
    //Store type, name, and parent
    yMap.set(ReservedKeys.dataType, handler.name);
    yMap.set(ReservedKeys.nodeName, name);
    yMap._prelimParent = parent;

    //Populate recursively and return
    handler.toYjs(yMap, jValue, javascriptToYjs);
    return yMap;
}