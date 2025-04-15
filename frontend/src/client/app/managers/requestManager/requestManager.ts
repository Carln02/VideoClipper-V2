export class RequestManager {
    protected readonly baseUrl = "http://localhost:3000/" as const;

    protected makeRequest(
        url: string,
        method: string,
        body: any,
        onSuccess: (response: any) => void = () => {},
        onFailure: (message: string) => void = () => {},
        parse: boolean = false): void {
        const request = new XMLHttpRequest();
        request.onreadystatechange = _ => {
            if (request.readyState !== 4) return;
            if (request.status !== 200) {
                onFailure(request.responseText);
                return;
            }
            parse ? onSuccess(JSON.parse(request.responseText)) : onSuccess(request.responseText);
        }

        request.open(method, url, true);
        if (!(body instanceof FormData)) {
            request.setRequestHeader("Content-Type", "application/json");
            body = JSON.stringify(body);
        }

        request.send(body);
    }

}