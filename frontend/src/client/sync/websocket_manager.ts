import * as Y from "yjs";
import * as YW from "y-websocket";

export default class WebsocketProvider {
	private ws: YW.WebsocketProvider;

	private connect: any;
	private disconnect: any;

	public constructor(room: string, ydoc: Y.Doc, wsOpts: any = {}) {
		const isSecure = window.location.protocol === "https:";
		const protocol = isSecure ? "wss" : "ws";
		const hostname = window.location.hostname;
		const port = hostname == "localhost" ? ":3000" : "";
		const serverUrl = `${protocol}://${hostname}${port}`;
		console.log(serverUrl);

		if (!navigator.onLine) {
			wsOpts.connect = false;
		}

		this.ws = new YW.WebsocketProvider(serverUrl, room, ydoc, wsOpts);

		this.connect = () => this.ws.connect();
		this.disconnect = () => this.ws.disconnect();

		window.addEventListener("online", this.connect);
		window.addEventListener("offline", this.disconnect);
	}


	public destroy() {
		window.removeEventListener('online', this.connect);
		window.removeEventListener('offline', this.disconnect);

		this.ws.destroy();
	}
}