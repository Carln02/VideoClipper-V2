import {YArray, YMap} from "../../conversionManagment/yjsEnhancement";
import {YHandler} from "../yHandler";
import {YConverterCallback} from "../yHandlers.types";
import {ReservedKeys} from "../../yWrapper/yWrapper.types";

function fromYjs(yMap: YMap): unknown[] {
    return yMap.getForced(ReservedKeys.array).arrayForced();
}

function toYjs(yMap: YMap, array: unknown[], convert_to_yjs: YConverterCallback): void {
    const yArray = new YArray();
    for (const index in array) yArray.push([convert_to_yjs(array[index], index, yMap)]);
    yArray._prelimParent = yMap;
    yMap.set(ReservedKeys.array, yArray);
}

function diffFromYjs(yMap: YMap, oldArray: unknown[]): void {
    const remoteState = yMap.get(ReservedKeys.array);
    const newArray = remoteState.toArray();

    const addedValues = newArray.filter(value => !oldArray.includes(value));

    for (let i = 0; i < newArray.length; i++) {
        const newValue = newArray[i];

        while (oldArray[i] !== newValue) {
            if (addedValues[0] == newValue) oldArray.splice(i, 0, addedValues.splice(0, 1));
            else if (i < oldArray.length) oldArray.splice(i, 1)
            else oldArray.push(newArray[i])
        }
    }
}

function diffToYjs(yMap: YMap, newArray: unknown[]): void {
    const remoteState = yMap.get(ReservedKeys.array);
    const remoteArray = remoteState.toArray();

    const addedValues = newArray.filter(value => !remoteArray.includes(value));

    for (let i = 0; i < newArray.length; i++) {
        const newValue = newArray[i];

        while (remoteState.get(i) !== newValue) {
            if (addedValues[0] == newValue) remoteState.insert(i, addedValues.splice(0, 1));
            else if (i < remoteState.length) remoteState.delete(i)
            else remoteState.push([newArray[i]])
        }
    }
}

export const arrayHandler = new YHandler(Array, YMap, fromYjs, toYjs, diffFromYjs, diffToYjs);