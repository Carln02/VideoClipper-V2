import { Map } from 'yjs'

export type Primitive = string | boolean | number;

export type Path = Primitive[];



export type YWrappedObject<T = Object> = T & {
    get_observable(): boolean;
    set_observable(): void;
    get_observers(): Object[];
    observe(object: Object): void;
    unobserve(object: Object): void;
    forward_callbacks(object: Object): void;
    destroy_observers(): void;
    get_closest_observable_parent(path?: Path): YWrappedObject | undefined;
    has_parent(): boolean;
    get_parent(): YWrappedObject | undefined;
    unwrap(): YWrappedInfo;
    toJSON(): T;
    get_key(): Primitive;
    reindex(): void;
};

export type YWrappedValue<T = Object> = YWrappedObject<T> | Primitive;

export type YjsMap<T = any> = Map<T>;

export type YjsValue<T = any> = YjsMap<T> | Primitive;



export type TypeHandler = {
    from_yjs(ymap: YjsMap, recurse?: boolean): Object;
    to_yjs(ymap: YjsMap, object: Object, convert_to_yjs: Converter): void;
    diff_from_yjs(ymap: YjsMap, old_object: Object): void;
    diff_to_yjs(ymap: YjsMap, new_object: Object): void;
};

export type Converter = (jvalue: any, name: string, parent: YjsMap) => YjsValue;

export type YWrappedInfo = {
    ymap: YjsMap,
    raw: any,
    parent: YjsMap | null,
    observers: any[],
    batch_timer: number
};


