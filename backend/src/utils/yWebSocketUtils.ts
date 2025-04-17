//TAKEN FROM y-websocket AND REORGANIZED INTO CLASS

import * as Y from "yjs";
import http from "http";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import * as map from "lib0/map";
import {LeveldbPersistence} from "y-leveldb";
import {YPersistence, YPersistenceConnectionOptions} from "./utils.types";
import {WSSharedDoc} from "./wsSharedDoc";

export class YWebSocketUtils {
    private readonly CALLBACK_URL = process.env.CALLBACK_URL ? new URL(process.env.CALLBACK_URL) : null;
    private readonly CALLBACK_TIMEOUT = Number.parseInt(process.env.CALLBACK_TIMEOUT || "5000");
    private readonly CALLBACK_OBJECTS = process.env.CALLBACK_OBJECTS ? JSON.parse(process.env.CALLBACK_OBJECTS) : {};
    public readonly CALLBACK_DEBOUNCE_WAIT = parseInt(process.env.CALLBACK_DEBOUNCE_WAIT || "2000");
    public readonly CALLBACK_DEBOUNCE_MAXWAIT = parseInt(process.env.CALLBACK_DEBOUNCE_MAXWAIT || "10000");

    private readonly wsReadyStateConnecting = 0;
    private readonly wsReadyStateOpen = 1;
    private readonly wsReadyStateClosing = 2;
    private readonly wsReadyStateClosed = 3;

    // disable gc when using snapshots!
    private readonly persistenceDir = process.env.YPERSISTENCE;

    public readonly messageSync = 0;
    public readonly messageAwareness = 1;

    public readonly isCallbackSet = !!this.CALLBACK_URL;
    public readonly docs = new Map();

    public persistence: YPersistence | null = null;

    public constructor(persistenceDir?: string) {
        this.persistenceDir = persistenceDir ?? process.env.YPERSISTENCE ?? "";
        if (this.persistenceDir) {
            console.info("Persisting documents to \"" + this.persistenceDir + '"');
            const ldb = new LeveldbPersistence(this.persistenceDir);
            this.persistence = {
                provider: ldb,
                bindState: async (docName, ydoc) => {
                    const persistedYdoc = await ldb.getYDoc(docName);
                    const newUpdates = Y.encodeStateAsUpdate(ydoc);
                    ldb.storeUpdate(docName, newUpdates);
                    Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));
                    ydoc.on("update", (update: any) => ldb.storeUpdate(docName, update));
                },
                writeState: async (docName, ydoc) => {
                    const state = Y.encodeStateAsUpdate(ydoc);
                    await ldb.storeUpdate(docName, state);
                }
            }
        }
    }

    /**
     * @param {Uint8Array} update
     * @param {any} origin
     * @param {WSSharedDoc} doc
     */
    public callbackHandler = (update: Uint8Array, origin: any, doc: WSSharedDoc) => {
        const room = doc.name;
        const dataToSend = {
            room: room,
            data: {} as Record<string, any>,
        }
        const sharedObjectList = Object.keys(this.CALLBACK_OBJECTS);
        sharedObjectList.forEach(sharedObjectName => {
            const sharedObjectType = this.CALLBACK_OBJECTS[sharedObjectName];
            dataToSend.data[sharedObjectName] = {
                type: sharedObjectType,
                content: this.getContent(sharedObjectName, sharedObjectType, doc).toJSON()
            }
        });
        this.callbackRequest(this.CALLBACK_URL as URL, this.CALLBACK_TIMEOUT, dataToSend);
    }

    /**
     * @param {URL} url
     * @param {number} timeout
     * @param {Object} data
     */
    private callbackRequest = (url: URL, timeout: number, data: Object) => {
        data = JSON.stringify(data);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            timeout: timeout,
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Content-Length": "length" in data ? data.length as number : 0
            }
        };
        const req = http.request(options);
        req.on("timeout", () => {
            console.warn('Callback request timed out.');
            req.abort();
        });
        req.on('error', (e) => {
            console.error('Callback request error.', e);
            req.abort();
        });
        req.write(data);
        req.end();
    }

    /**
     * @param {string} objName
     * @param {string} objType
     * @param {WSSharedDoc} doc
     */
    private getContent = (objName: string, objType: string, doc: WSSharedDoc): Y.AbstractType<any> => {
        switch (objType) {
            case "Array":
                return doc.getArray(objName);
            case "Map":
                return doc.getMap(objName);
            case "Text":
                return doc.getText(objName);
            case "XmlFragment":
                return doc.getXmlFragment(objName);
            case "XmlElement":
                return doc.get(objName, Y.XmlElement);
            default :
                return {} as Y.AbstractType<any>;
        }
    }

    /**
     * @param {Uint8Array} update
     * @param {any} origin
     * @param {WSSharedDoc} doc
     */
    public updateHandler = (update: Uint8Array, origin: any, doc: WSSharedDoc) => {
        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, this.messageSync)
        syncProtocol.writeUpdate(encoder, update)
        const message = encoding.toUint8Array(encoder)
        doc.conns.forEach((_, conn) => this.send(doc, conn, message))
    }

    /**
     * Gets a Y.Doc by name, whether in memory or on disk
     *
     * @param {string} docName - the name of the Y.Doc to find or create
     * @param {boolean} gc - whether to allow gc on the doc (applies only when created)
     * @return {WSSharedDoc}
     */
    public getYDoc = (docName: string, gc: boolean =
    process.env.GC !== "false" && process.env.GC !== "0"): WSSharedDoc => {
        return map.setIfUndefined(this.docs, docName, () => {
            const doc = new WSSharedDoc(docName, this, gc);
            if (this.persistence !== null) this.persistence.bindState(docName, doc);
            this.docs.set(docName, doc);
            return doc;
        });
    }

    /**
     * @param {any} conn
     * @param {WSSharedDoc} doc
     * @param {Uint8Array} message
     */
    private messageListener = (conn: any, doc: WSSharedDoc, message: Uint8Array) => {
        try {
            const encoder = encoding.createEncoder()
            const decoder = decoding.createDecoder(message)
            const messageType = decoding.readVarUint(decoder)
            switch (messageType) {
                case this.messageSync:
                    encoding.writeVarUint(encoder, this.messageSync)
                    syncProtocol.readSyncMessage(decoder, encoder, doc, null)
                    if (encoding.length(encoder) > 1) this.send(doc, conn, encoding.toUint8Array(encoder))
                    break
                case this.messageAwareness: {
                    awarenessProtocol.applyAwarenessUpdate(doc.awareness, decoding.readVarUint8Array(decoder), conn)
                    break
                }
            }
        } catch (err) {
            console.error(err)
            // doc.emit('error', [err])
        }
    }

    /**
     * @param {WSSharedDoc} doc
     * @param {any} conn
     */
    private closeConn = (doc: WSSharedDoc, conn: any) => {
        if (doc.conns.has(conn)) {
            const controlledIds: Set<number> = doc.conns.get(conn) as Set<number>;
            doc.conns.delete(conn);
            awarenessProtocol.removeAwarenessStates(doc.awareness, Array.from(controlledIds), null);
            if (doc.conns.size === 0 && this.persistence !== null) {
                // if persisted, we store state and destroy ydocument
                this.persistence.writeState(doc.name, doc).then(() => doc.destroy());
                this.docs.delete(doc.name);
            }
        }
        conn.close();
    }

    /**
     * @param {WSSharedDoc} doc
     * @param {any} conn
     * @param {Uint8Array} m
     */
    public send = (doc: WSSharedDoc, conn: any, m: Uint8Array) => {
        if (conn.readyState !== this.wsReadyStateConnecting && conn.readyState !== this.wsReadyStateOpen) this.closeConn(doc, conn);
        try {
            conn.send(m, (err: any) => { err != null && this.closeConn(doc, conn) });
        } catch (e) {
            this.closeConn(doc, conn)
        }
    }

    /**
     * @param {any} conn
     * @param {any} req
     * @param {any} opts
     */
    public setupWSConnection(conn: any, req: any, opts: YPersistenceConnectionOptions = {}) {
        if (!opts.docName) opts.docName = req.url.slice(1).split("?")[0];
        if (!opts.gc) opts.gc = true;
        conn.binaryType = "arraybuffer";

        // get doc, initialize if it does not exist yet
        const doc = this.getYDoc(opts.docName as string, opts.gc);
        doc.conns.set(conn, new Set());
        // listen and reply to events
        conn.on("message", (message: ArrayBuffer) => this.messageListener(conn, doc, new Uint8Array(message)));

        // Check if connection is still alive
        let pongReceived = true
        const pingInterval = setInterval(() => {
            if (!pongReceived) {
                if (doc.conns.has(conn)) this.closeConn(doc, conn);
                clearInterval(pingInterval);
            } else if (doc.conns.has(conn)) {
                pongReceived = false;
                try {
                    conn.ping();
                } catch (e) {
                    this.closeConn(doc, conn);
                    clearInterval(pingInterval);
                }
            }
        }, pingTimeout)
        conn.on("close", () => {
            this.closeConn(doc, conn);
            clearInterval(pingInterval);
        });
        conn.on("pong", () => pongReceived = true);
        // put the following in a variables in a block so the interval handlers don't keep in in
        // scope
        {
            // send sync step 1
            const encoder = encoding.createEncoder()
            encoding.writeVarUint(encoder, this.messageSync)
            syncProtocol.writeSyncStep1(encoder, doc)
            this.send(doc, conn, encoding.toUint8Array(encoder))
            const awarenessStates = doc.awareness.getStates()
            if (awarenessStates.size > 0) {
                const encoder = encoding.createEncoder()
                encoding.writeVarUint(encoder, this.messageAwareness)
                encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(doc.awareness, Array.from(awarenessStates.keys())))
                this.send(doc, conn, encoding.toUint8Array(encoder))
            }
        }
    }
}


const pingTimeout = 30000

