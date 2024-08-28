import {YHandler} from "./yHandler";

export class YHandlerRegistry {
    private readonly handlers: Map<string, YHandler>;

    constructor(...handlers: YHandler[]) {
        this.handlers = new Map<string, YHandler>();
        handlers.forEach(handler => this.add(handler));
    }

    public add(handler: YHandler): void {
        this.handlers.set(handler.name, handler);
    }

    public remove(handler: YHandler): void {
        this.handlers.delete(handler.name);
    }

    public getHandler(object: object): YHandler {
        const handler = this.handlers.get(object.constructor.name);
        if (handler) return handler;

        for (const [, handler] of this.handlers) {
            const constructor = handler.classType;
            if (object instanceof constructor) return handler;
        }

        throw new Error(`No handler found for object type: ${object.constructor.name}.`);
    }

    public getHandlerByType(type: string) {
        return this.handlers.get(type);
    }
}