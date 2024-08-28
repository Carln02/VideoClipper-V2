import "./utils";
import {content_observer} from "./eventManagement/observer";
import {YMap} from "./conversionManagment/yjsEnhancement";
import {ReservedKeys} from "./yWrapper/yWrapper.types";
import {YWrappedObject} from "./yWrapper/yWrapper.types";
import {yMapToWrapped, yMapToWrappedIfExists} from "./conversionManagment/converter";

//	Public wrap function

export default function wrap(yMap: YMap): YWrappedObject {
    const res = yMapToWrappedIfExists(yMap);
    if (res != undefined) return res;

    yMap.set(ReservedKeys.dataType, "Object");
    yMap.set(ReservedKeys.nodeName, "root");

    yMap.observeDeep(content_observer);

    return yMapToWrapped(yMap);
}