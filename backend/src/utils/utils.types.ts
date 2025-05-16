import {WSSharedDoc} from "./wsSharedDoc";

export type YPersistence = {
    bindState: (str: string, doc: WSSharedDoc) => void,
    writeState: (str: string, doc: WSSharedDoc) => Promise<any>, provider: any
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