import {WebsocketProvider} from "y-websocket";
import {WebsocketOptions} from "./websocketManager.types";
import {YDoc} from "../../../yManagement/yManagement.types";
import {Delegate} from "turbodombuilder";
import {encodeStateVector} from "yjs";
import * as decoding from "lib0/decoding";

export class WebsocketManager {
    private provider: WebsocketProvider;
    private readonly serverUrl: string;
    private readonly room: string;
    private readonly ydoc: YDoc;
    private readonly debug: boolean;

    public readonly onConnect: Delegate<() => void> = new Delegate();
    public readonly onDisconnect: Delegate<() => void> = new Delegate();

    private readonly handleConnect = () => this.provider.connect();
    private readonly handleDisconnect = () => this.provider.disconnect();

    public constructor(room: string, ydoc: YDoc, websocketOptions?: WebsocketOptions) {
        if (!websocketOptions) websocketOptions = {debug: true};
        if (!websocketOptions.options) websocketOptions.options = {};

        this.room = room;
        this.ydoc = ydoc;
        this.debug = websocketOptions.debug;
        this.serverUrl = websocketOptions.serverUrl ?? this.defaultUrl;
        if (!navigator.onLine) websocketOptions.options.connect = false;

        window.addEventListener("online", this.handleConnect, {once: true});
        window.addEventListener("offline", this.handleDisconnect, {once: true});

        const tempProvider = new WebsocketProvider(this.serverUrl, this.room, this.ydoc, websocketOptions.options);
        this.provider = new WebsocketProvider(this.serverUrl, this.room, this.ydoc, websocketOptions.options);
        if (websocketOptions.debug) this.setupDebug();

        this.provider.on("status", (event: { status: string }) => {
            if (event.status === "disconnected" && this.onDisconnect) this.onDisconnect.fire();
        });

        this.provider.on("sync", (isSynced: boolean) => {
            if (!isSynced) return;
            tempProvider.disconnect();
            this.onConnect.fire();
        });

        if (this.provider.synced) requestAnimationFrame(() => {
            tempProvider.disconnect();
            this.onConnect.fire();
        });
    }

    private get defaultUrl(): string {
        const isSecure = window.location.protocol === "https:";
        const protocol = isSecure ? "wss" : "ws";
        const hostname = window.location.hostname;
        const port = hostname === "localhost" ? ":3000" : "";
        return `${protocol}://${hostname}${port}`;
    }

    public destroy(): void {
        window.removeEventListener("online", this.handleConnect);
        window.removeEventListener("offline", this.handleDisconnect);
        this.provider.destroy();
        if (this.debug) console.log(`[Yjs] Disconnected from room: ${this.room}`);
    }

    public get status(): "connected" | "disconnected" {
        return this.provider.wsconnected ? "connected" : "disconnected";
    }

    public get awareness() {
        return this.provider.awareness;
    }

    public reconnect(): void {
        this.provider.disconnect();
        this.provider.connect();
    }

    private setupDebug() {
        console.log(`[Yjs] Connected to ${this.serverUrl}, room: ${this.room}`);
        console.log("🌐 Connecting to", this.provider.url);
        console.log("WebSocket state:", this.provider.wsconnected);

        this.provider.on('sync', (isSynced: boolean) => {
            console.log(`🔄 [Client] Sync status changed: ${isSynced} for room: ${this.room}`);
            if (isSynced) {
                const content = this.ydoc.getMap("document_content");
                console.log(`📊 [Client] Doc content after sync:`, {
                    keys: Array.from(content.keys()),
                    size: content.size,
                    clientId: this.ydoc.clientID,
                    stateVector: Array.from(encodeStateVector(this.ydoc))
                });
            }
        });

        this.provider.on('status', (event: { status: string }) => {
            console.log(`🔌 [Client] Status: ${event.status}, Synced: ${this.provider.synced}`);
        });

        // Add this to debug raw websocket messages:
        this.provider.ws?.addEventListener('message', (event) => {
            const data = new Uint8Array(event.data);
            console.log(`📨 [Client] Raw WebSocket message received: ${data.length} bytes`);

            try {
                const decoder = decoding.createDecoder(data);
                const messageType = decoding.readVarUint(decoder);

                const messageTypes = {
                    0: 'SYNC',
                    1: 'AWARENESS'
                };

                console.log(`📨 [Client] Message type: ${messageTypes[messageType] || messageType} (${messageType})`);

                if (messageType === 0) { // SYNC message
                    // Try to decode sync step
                    const syncStep = decoding.readVarUint(decoder);
                    console.log(`🔄 [Client] Sync step: ${syncStep}`);
                }
            } catch (e) {
                console.log(`📨 [Client] Could not decode message type:`, e);
            }
        });

        // Also add this to monitor document changes more precisely:
        this.ydoc.on('update', (update: Uint8Array, origin: any) => {
            console.log(`✍️ [Client] Document updated, origin:`, origin, 'update size:', update.length);

            // Log the current document state
            const content = this.ydoc.getMap("document_content");
            if (content) {
                console.log(`📊 [Client] Current document_content:`, content.toJSON());
            }

            const testMap = this.ydoc.getMap("test");
            if (testMap) {
                console.log(`🧪 [Client] Current test map:`, testMap.toJSON());
            }
        });

        this.provider.ws?.addEventListener('open', () => {
            console.log(`🟢 [Client] WebSocket opened for room: ${this.room}`);
        });

        this.provider.ws?.addEventListener('error', (error) => {
            console.error(`❌ [Client] WebSocket error for room: ${this.room}`, error);
        });

        this.provider.ws?.addEventListener('close', (event) => {
            console.log(`🔴 [Client] WebSocket closed for room: ${this.room}, code: ${event.code}, reason: ${event.reason}`);
        });
    }
}
