import {YNumber, YProxied} from "../../../../../yProxy/yProxy/types/proxied.types";

export type ResizableType = {
    boxWidth?: number,
    boxHeight?: number,
};

export type SyncedResizableType = YProxied<{
    boxWidth?: YNumber,
    boxHeight?: YNumber,
}>;