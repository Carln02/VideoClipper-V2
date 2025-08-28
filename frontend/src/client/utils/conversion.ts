export function blobToUrl(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.readAsDataURL(blob);
    });
}

export function urlToBlob(url: string): Promise<Blob> {
    return new Promise((resolve) => {
        fetch(url).then(res => resolve(res.blob()));
    });
}