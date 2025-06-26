import {WebSocketSharedDoc} from "./webSocket.sharedDoc";

export type YPersistence = {
    bindState: (str: string, doc: WebSocketSharedDoc) => Promise<void>,
    writeState: (str: string, doc: WebSocketSharedDoc) => Promise<any>, provider: any
};

export type YPersistenceConnectionOptions = {
    docName?: string,
    gc?: boolean
};

declare module "http" {
    interface IncomingMessage {
        user?: any;
    }
}