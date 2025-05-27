import {WebsocketProvider as YWebsocketProvider} from "y-websocket";

export type WebsocketOptions = {
    serverUrl?: string,
    options?: Partial<ConstructorParameters<typeof YWebsocketProvider>[3]>,
    debug?: boolean
};