export enum ContextView {
    home = "Home",
    canvas = "Canvas",
    camera = "Camera"
}

export type ContextEntry = {
    element?: Element,
    level?: number,
    changed?: "added" | "removed"
}