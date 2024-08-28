import {YMap} from "../conversionManagment/yjsEnhancement";
import {diffToYjs, javascriptToYjs, yjsToWrapped, yMapToWrapped} from "../conversionManagment/converter";
import {ReservedKeys} from "./yWrapper.types";
import {config} from "../config";
import {dispatch_callbacks_local} from "../eventManagement/observer";
import * as utils from "./utils";
import {YWrappedInfo, YWrappedObject} from "./yWrapper.types";
import {YChange} from "../eventManagement/eventManagement.types";


//Main proxy handler
export function makeYWrapProxy<Type extends object = object>(yMap: YMap, object: Type, parent: YMap | null)
    : YWrappedObject<Type> {
    const info: YWrappedInfo = {
        yMap: yMap,		//	TODO use WeakRef ?
        rawObject: object,	//	TODO use WeakRef ?
        parent: parent,
        observers: [],
        callbacks: [],
        batchTimer: null
    }

    const handle = function (key: string | symbol, change_type: string, change: YChange) {
        //Timer is already set, and we don't want to reset it
        if (info.batchTimer && !config.batch_changes_rolling) return;

        //Else, let's reset the timer !
        clearTimeout(info.batchTimer);
        info.batchTimer = setTimeout(() => diffToYjs(info), config.batch_changes_ms);

        //	TODO
        dispatch_callbacks_local(yMapToWrapped(info.yMap), key.toString(), change_type, change);
    }

    return new Proxy(object, {
        get: function (parent: Type, key: string | symbol) {
            //First and foremost, forbid access to YWrapper properties
            if ((Object.values(ReservedKeys) as string[]).includes(key.toString()))
                throw `Trying to access a protected YWrapper property, access forbidden`;

            //If accessing one of YWrapper's util functions, simply return that
            if (key in utils) return (...args) => utils[key](info, ...args);

            //Else, simply return the converted value
            return yjsToWrapped(parent[key], parent.hasOwnProperty(key));
        },

        set: function (parent: Type, key: string | symbol, value: unknown) {
            //First and foremost, forbid access to YWrapper properties
            if ((Object.values(ReservedKeys) as string[]).includes(key.toString()))
                throw `Trying to write to a protected YWrapper property, access forbidden`;

            //You also can't override YWrapper-provided utilities
            if (key in utils) throw "Trying to override a protected YWrapper utility, access forbidden";

            const changeType = parent.hasOwnProperty(key) ? "update" : "add";

            //Else, simply set the converted value
            const old = yjsToWrapped(parent[key]);
            parent[key] = javascriptToYjs(value, key.toString(), info.yMap);
            handle(key, changeType, {old: old, new: yjsToWrapped(parent[key])});
            return true;
        },

        deleteProperty: function (parent: Type, key: string | symbol) {
            //First and foremost, forbid access to YWrapper properties
            if ((Object.values(ReservedKeys) as string[]).includes(key.toString()))
                throw "Trying to write to a protected YWrapper property, access forbidden";

            //You also can't override YWrapper-provided utilities
            if (key in utils) throw "Trying to override a protected YWrapper utility, access forbidden";

            //Else, simply delete the specified value
            const old = yjsToWrapped(parent[key]);
            delete parent[key];
            handle(key, "delete", {old: old, new: undefined});
            return true;
        }
    }) as YWrappedObject<Type>;
}