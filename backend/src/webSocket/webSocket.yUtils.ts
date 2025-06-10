//TAKEN FROM y-websocket AND REORGANIZED INTO CLASS

import * as Y from "yjs";
import http from "http";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import {LeveldbPersistence} from "y-leveldb";
import {YPersistence, YPersistenceConnectionOptions} from "./webSocket.types";
import {WebSocketSharedDoc} from "./webSocket.sharedDoc";

export class WebSocketYUtils {
    public readonly DEBUG: boolean = true;

    private readonly CALLBACK_URL = process.env.CALLBACK_URL ? new URL(process.env.CALLBACK_URL) : null;
    private readonly CALLBACK_TIMEOUT = Number.parseInt(process.env.CALLBACK_TIMEOUT || "5000");
    private readonly CALLBACK_OBJECTS = process.env.CALLBACK_OBJECTS ? JSON.parse(process.env.CALLBACK_OBJECTS) : {};
    public readonly CALLBACK_DEBOUNCE_WAIT = parseInt(process.env.CALLBACK_DEBOUNCE_WAIT || "2000");
    public readonly CALLBACK_DEBOUNCE_MAXWAIT = parseInt(process.env.CALLBACK_DEBOUNCE_MAXWAIT || "10000");

    private readonly wsReadyStateConnecting = 0;
    private readonly wsReadyStateOpen = 1;
    private readonly wsReadyStateClosing = 2;
    private readonly wsReadyStateClosed = 3;

    private readonly pingTimeout = 30000;

    // disable gc when using snapshots!
    private readonly persistenceDir = process.env.PERSISTENCE_PATH;

    public readonly messageSync = 0;
    public readonly messageAwareness = 1;

    public readonly isCallbackSet = !!this.CALLBACK_URL;
    public readonly docs = new Map();

    public persistence: YPersistence | null = null;

    public constructor(persistenceDir?: string) {
        this.persistenceDir = persistenceDir ?? process.env.PERSISTENCE_PATH ?? "";
        if (this.persistenceDir) {
            console.info("Persisting documents to \"" + this.persistenceDir + '"');
            const ldb = new LeveldbPersistence(this.persistenceDir);
            this.persistence = {
                provider: ldb,
                bindState: async (docName, ydoc) => {
                    const persistedYdoc = await ldb.getYDoc(docName);
                    const persistedContent = persistedYdoc.getMap("document_content");
                    Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc))

                    ydoc.on("update", async (update: any) => {
                        console.log("💾 STORING UPDATE")
                        await ldb.storeUpdate(docName, update);
                        // await this.persistence?.provider.storeUpdate(docName, update);
                    });

                    // if (persistedContent.size === 0) {
                    //     // Only initialize if no persisted state exists
                    //     console.log("🆕 Initializing new document content");
                    //     const content = ydoc.getMap("document_content");
                    //     content.set("cards", new Y.Map());
                    //     content.set("branchingNodes", new Y.Map());
                    //     content.set("flows", new Y.Map());
                    //     content.set("media", new Y.Map());
                    //     content.set("counters", new Y.Map([["cards", 0], ["flows", 0]]));
                    // }
                },
                writeState: async (docName, ydoc) => {
                    await ldb.storeUpdate(docName, Y.encodeStateAsUpdateV2(ydoc));
                }
            }
        }
    }

    /**
     * @param {Uint8Array} update
     * @param {any} origin
     * @param {WebSocketSharedDoc} doc
     */
    public callbackHandler = (update: Uint8Array, origin: any, doc: WebSocketSharedDoc) => {
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
     * @param {WebSocketSharedDoc} doc
     */
    private getContent = (objName: string, objType: string, doc: WebSocketSharedDoc): Y.AbstractType<any> => {
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
     * @param {WebSocketSharedDoc} doc
     */
    public updateHandler = (update: Uint8Array, origin: any, doc: WebSocketSharedDoc) => {
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
     * @return {WebSocketSharedDoc}
     */
    public getYDoc = async (docName: string, gc: boolean = true): Promise<WebSocketSharedDoc> => {
        if (this.docs.has(docName)) return this.docs.get(docName)!;
        const doc = new WebSocketSharedDoc(docName, this, gc);

        if (this.persistence !== null) await this.persistence.bindState(docName, doc);
        this.docs.set(docName, doc);
        return doc;
    };

    /**
     * @param {any} conn
     * @param {WebSocketSharedDoc} doc
     * @param {Uint8Array} message
     */
    private messageListener = (conn: any, doc: WebSocketSharedDoc, message: Uint8Array) => {
        try {
            const encoder = encoding.createEncoder()
            const decoder = decoding.createDecoder(message)
            const messageType = decoding.readVarUint(decoder)

            if (this.DEBUG) console.log(`📨 Processing message type: ${messageType} for doc: ${doc.name} with length: ${message.length}`);

            switch (messageType) {
                case this.messageSync:
                    encoding.writeVarUint(encoder, this.messageSync)
                    if (this.DEBUG) console.log(`🔄 Processing sync message for ${doc.name}`);
                    if (this.DEBUG) this.debugDocState(doc, "BEFORE_SYNC");
                    syncProtocol.readSyncMessage(decoder, encoder, doc, null);
                    if (this.DEBUG) this.debugDocState(doc, "AFTER_SYNC");

                    if (encoding.length(encoder) > 1) {
                        if (this.DEBUG) console.log(`📤 Sending sync response for ${doc.name}, length: ${encoding.length(encoder)}`);
                        this.send(doc, conn, encoding.toUint8Array(encoder))
                    } else {
                        if (this.DEBUG) console.log(`📭 No sync response needed for ${doc.name}`);
                    }
                    break

                case this.messageAwareness:
                    if (this.DEBUG) console.log(`👥 Processing awareness update for ${doc.name}`);
                    awarenessProtocol.applyAwarenessUpdate(doc.awareness, decoding.readVarUint8Array(decoder), conn)
                    break

                default:
                    if (this.DEBUG) console.warn(`❓ Unknown message type: ${messageType} for doc: ${doc.name}`);
            }
        } catch (err) {
            if (this.DEBUG) console.error(`❌ Error processing message for ${doc.name}:`, err)
        }
    }

    /**
     * @param {WebSocketSharedDoc} doc
     * @param {any} conn
     */
    private closeConn = (doc: WebSocketSharedDoc, conn: any) => {
        console.log("CLOSING CONN...");
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
     * @param {WebSocketSharedDoc} doc
     * @param {any} conn
     * @param {Uint8Array} m
     */
    public send = (doc: WebSocketSharedDoc, conn: any, m: Uint8Array) => {
        if (conn.readyState !== this.wsReadyStateConnecting && conn.readyState !== this.wsReadyStateOpen) {
            this.closeConn(doc, conn);
        }
        try {
            console.log("SENDING CONN", m);
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
    public async setupWSConnection(conn: any, req: any, opts: YPersistenceConnectionOptions = {}) {
        // 1. Get doc name and GC flag
        const docName = opts.docName ?? req.url?.slice(1).split("?")[0];
        const gc = opts.gc ?? (process.env.GC !== "false" && process.env.GC !== "0");

        if (!docName) {
            console.warn("❌ No docName in setupWSConnection");
            conn.close();
            return;
        }

        conn.binaryType = "arraybuffer";

        // 2. Await the doc to be loaded and bound (persistence-aware)
        const doc = await this.getYDoc(docName, gc);
        if (this.DEBUG) console.log("📄 Y.Doc ready for:", docName);

        // 3. Register connection before sending sync
        doc.conns.set(conn, new Set());

        // 4. Listen for incoming messages
        conn.on("message", (message: ArrayBuffer) => {
            if (this.DEBUG) console.log(`📩 Received ${message.byteLength} bytes from client for ${doc.name}`);
            this.messageListener(conn, doc, new Uint8Array(message));
        });

        // 5. Heartbeat ping-pong (prevents stale connections)
        let pongReceived = true;
        const pingInterval = setInterval(() => {
            if (!pongReceived) {
                console.warn("❌ Ping timeout, closing connection for", doc.name);
                this.closeConn(doc, conn);
                clearInterval(pingInterval);
            } else if (doc.conns.has(conn)) {
                pongReceived = false;
                try {
                    conn.ping();
                } catch (e) {
                    console.warn("❌ Ping failed, closing connection for", doc.name);
                    this.closeConn(doc, conn);
                    clearInterval(pingInterval);
                }
            }
        }, this.pingTimeout);

        conn.on("pong", () => pongReceived = true);
        conn.on("close", () => {
            console.log("🔌 Connection closed for", doc.name);
            this.closeConn(doc, conn);
            clearInterval(pingInterval);
        });

        // 6. Send sync step 1

        if (this.DEBUG) console.log(`📤 Sending sync step 1 for ${doc.name}`);
        if (this.DEBUG) this.debugDocState(doc, "BEFORE_SYNC_STEP1");

        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, this.messageSync);
        syncProtocol.writeSyncStep1(encoder, doc);
        const syncMessage = encoding.toUint8Array(encoder);

        if (this.DEBUG) console.log(`📤 Sync step 1 message size: ${syncMessage.length} bytes`);
        this.send(doc, conn, syncMessage);

        // 7. Send awareness states if any exist
        const awarenessStates = doc.awareness.getStates();
        if (awarenessStates.size > 0) {
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, this.messageAwareness);
            encoding.writeVarUint8Array(
                encoder,
                awarenessProtocol.encodeAwarenessUpdate(doc.awareness, Array.from(awarenessStates.keys()))
            );
            if (this.DEBUG) console.log("📤 Sending initial awareness state for", doc.name);
            this.send(doc, conn, encoding.toUint8Array(encoder));
        }

        if (this.DEBUG) console.log("✅ setupWSConnection complete for", doc.name);
    }

    private debugDocState(doc: WebSocketSharedDoc, label: string) {
        const content = doc.getMap("document_content");
        console.log(`🔍 [${label}] Doc state for ${doc.name}:`, {
            clientId: doc.clientID,
            contentKeys: Array.from(content.keys()),
            contentSize: content.size,
            stateVector: Array.from(Y.encodeStateVector(doc)),
            state: doc.getMap("document_content")?.toJSON(),
            connections: doc.conns.size
        });
    }
}