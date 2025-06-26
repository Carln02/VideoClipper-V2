export class RequestHandler {
    protected readonly isSecure = window.location.protocol === "https:";
    protected readonly protocol = this.isSecure ? "https" : "http";
    protected readonly hostname = window.location.hostname;
    protected readonly port = this.hostname == "localhost" || this.hostname == "127.0.0.1" ? ":3000" : "";
    protected readonly serverUrl = `${this.protocol}://${this.hostname}${this.port}/`;

    protected makeRequest(
        url: string,
        method: string,
        body: any,
        onSuccess: (response: any) => void = () => {},
        onFailure: (message: string) => void = () => {},
        parse: boolean = false,
        responseType: XMLHttpRequestResponseType = "text"): void {
        const request = new XMLHttpRequest();
        request.responseType = responseType;

        request.onreadystatechange = _ => {
            if (request.readyState !== 4) return;
            if (request.status < 200 || request.status >= 300) {
                onFailure(request.response);
                return;
            }
            if (parse) {
                try {
                    onSuccess(typeof request.response === "string"
                        ? JSON.parse(request.response)
                        : JSON.parse(new TextDecoder().decode(request.response)));
                } catch (err) {
                    onFailure("Failed to parse JSON: " + err.message);
                }
            } else onSuccess(request.response);
        }

        request.open(method, url, true);
        if (!(body instanceof FormData)) {
            request.setRequestHeader("Content-Type", "application/json");
            body = JSON.stringify(body);
        }

        request.send(body);
    }
}