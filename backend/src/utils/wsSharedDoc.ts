//TAKEN FROM y-websocket AND REORGANIZED

import * as Y from "yjs";
import * as mutex from "lib0/mutex";
import * as encoding from "lib0/encoding";
import debounce from "lodash.debounce";
import * as awarenessProtocol from "y-protocols/awareness";
import {YWebSocketUtils} from "./yWebSocketUtils";

export class WSSharedDoc extends Y.Doc {
    public readonly yWebSocketUtils: YWebSocketUtils;

    public name: string;
    public mux: mutex.mutex;
    public conns: Map<Object, Set<number>>;
    public awareness: awarenessProtocol.Awareness;

    /**
     * @param {{ added: Array<number>, updated: Array<number>, removed: Array<number> }} changes
     * @param {Object | null} conn Origin is the connection that made the change
     */
    private awarenessChangeHandler = (changes: {
        added: Array<number>,
        updated: Array<number>,
        removed: Array<number>
    }, conn: Object) => {
        const changedClients = changes.added.concat(changes.updated, changes.removed)
        if (conn !== null) {
            const connControlledIDs = this.conns.get(conn);
            if (connControlledIDs !== undefined) {
                changes.added.forEach(clientID => { connControlledIDs.add(clientID) });
                changes.removed.forEach(clientID => { connControlledIDs.delete(clientID) });
            }
        }
        // broadcast awareness update
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, this.yWebSocketUtils.messageAwareness)
        encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients))
        const buff = encoding.toUint8Array(encoder)
        this.conns.forEach((_, c) => this.yWebSocketUtils.send(this, c, buff));
    }

    /**
     * @param {string} name
     * @param yWebSocketUtils
     * @param gc
     */
    public constructor(name: string, yWebSocketUtils: YWebSocketUtils, gc: boolean = true) {
        super({gc: gc});
        this.yWebSocketUtils = yWebSocketUtils;
        this.name = name;
        this.mux = mutex.createMutex();
        this.conns = new Map();
        this.awareness = new awarenessProtocol.Awareness(this);
        this.awareness.setLocalState(null);

        this.awareness.on("update", this.awarenessChangeHandler);
        this.on("update", this.yWebSocketUtils.updateHandler as any);

        if (this.yWebSocketUtils.isCallbackSet) this.on("update", debounce(
            this.yWebSocketUtils.callbackHandler,
            this.yWebSocketUtils.CALLBACK_DEBOUNCE_WAIT,
            {maxWait: this.yWebSocketUtils.CALLBACK_DEBOUNCE_MAXWAIT}
        ) as any);
    }


}