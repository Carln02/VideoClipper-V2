import * as Y from 'yjs'
import * as YW from 'y-websocket'

export default class WebsocketProvider {
	private ws: YW.WebsocketProvider;

	private connect: any;
	private disconnect: any;

	public constructor(room: string, ydoc: Y.Doc , wsOpts: any = {}) {
		let online = window.navigator.onLine;
		if(!online) wsOpts.connect = false;

		this.ws = new YW.WebsocketProvider(`ws://${window.location.hostname}:3000`, room, ydoc, wsOpts);

		//	Needed so we can unregister on destroy
		this.connect = () => this.ws.connect();
		this.disconnect = () => this.ws.disconnect();

		window.addEventListener('online', this.connect);
		window.addEventListener('offline', this.disconnect);
	}

	public destroy() {
		window.removeEventListener('online', this.connect);
		window.removeEventListener('offline', this.disconnect);

		this.ws.destroy();
	}
}


