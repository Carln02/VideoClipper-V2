import { WebsocketProvider as YWebsocketProvider } from "y-websocket";
import { YDoc } from "../../yManagement/yManagement.types";

export interface WebsocketOptions {
	serverUrl?: string;
	options?: Partial<ConstructorParameters<typeof YWebsocketProvider>[3]>;
	debug?: boolean;
}

export default class WebsocketProvider {
	private provider: YWebsocketProvider;
	private readonly serverUrl: string;
	private readonly room: string;
	private readonly ydoc: YDoc;
	private readonly debug: boolean;

	private readonly handleConnect = () => this.provider.connect();
	private readonly handleDisconnect = () => this.provider.disconnect();

	public constructor(room: string, ydoc: YDoc, websocketOptions?: WebsocketOptions) {
		if (!websocketOptions) websocketOptions = {};
		if (!websocketOptions.options) websocketOptions.options = {};

		this.room = room;
		this.ydoc = ydoc;
		this.debug = websocketOptions.debug;

		this.serverUrl = websocketOptions.serverUrl ?? this.defaultUrl;

		if (!navigator.onLine) websocketOptions.options.connect = false;

		this.provider = new YWebsocketProvider(this.serverUrl, this.room, this.ydoc, websocketOptions.options);

		window.addEventListener("online", this.handleConnect);
		window.addEventListener("offline", this.handleDisconnect);
		if (websocketOptions.debug) console.log(`[Yjs] Connected to ${this.serverUrl}, room: ${room}`);
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
}
