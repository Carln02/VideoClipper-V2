import {YWrappedObject} from "../../../../yWrap/yWrapper/yWrapper.types";

type ElementTypeFromArray<ElementType> = ElementType extends (infer EntryType)[] ? (EntryType | ElementType) : ElementType;

type YWrapEventHandlers<DataType> = Partial<{
    [Key in keyof DataType as `on${Capitalize<string & Key>}Added`]:
    (value: ElementTypeFromArray<DataType[Key]>, path: (string | number)[]) => void;
} & {
    [Key in keyof DataType as `on${Capitalize<string & Key>}Updated`]:
    (newValue: ElementTypeFromArray<DataType[Key]>, oldValue: ElementTypeFromArray<DataType[Key]>, path: (string | number)[]) => void;
} & {
    [Key in keyof DataType as `on${Capitalize<string & Key>}Deleted`]:
    (value: ElementTypeFromArray<DataType[Key]>, path: (string | number)[]) => void;
} & {
    [Key in keyof DataType as `on${Capitalize<string & Key>}Changed`]:
    (newValue: ElementTypeFromArray<DataType[Key]>, oldValue: ElementTypeFromArray<DataType[Key]>, path: (string | number)[]) => void;
}>;

export type SyncedType<Type extends object = object> = YWrappedObject<Type>;

export type YWrapObserver<DataType extends YWrappedObject = YWrappedObject> = YWrapEventHandlers<DataType> & Partial<DataType>;

export type SyncedArray<Type extends object = SyncedType> = SyncedType<Array<Type>>;
