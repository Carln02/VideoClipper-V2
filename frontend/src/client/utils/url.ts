export function replaceUrlParams(...params: {name: string, value: string}[]) {
    const url = new URL(window.location.href);
    params.forEach(({name, value}) => url.searchParams.set(name, value));
    history.replaceState(null, "", url);
}

export function getUrlParam(name: string) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

export function pushUrlParams(...params: {name: string, value: string}[]) {
    const url = new URL(window.location.href);
    params.forEach(({name, value}) => url.searchParams.set(name, value));
    history.pushState(null, "", url);
}

export function clearUrlParams() {
    const url = new URL(window.location.href);
    url.searchParams.forEach((_, name) => url.searchParams.delete(name));
    history.replaceState(null, "", url);
}