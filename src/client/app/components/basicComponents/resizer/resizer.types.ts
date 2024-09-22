import {YNumber, YProxied} from "../../../../../yProxy/yProxy/types/proxied.types";

export type ResizableType = YProxied<{
    boxWidth?: YNumber,
    boxHeight?: YNumber,
}>;