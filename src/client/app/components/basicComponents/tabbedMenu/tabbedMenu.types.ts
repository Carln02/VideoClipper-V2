import {TurboProperties} from "turbodombuilder";

export type TabbedMenuProperties = TurboProperties & {
    values: string[];
    selectedValue?: string,
    defaultValueClass?: string,
    defaultSelectedValueClass?: string,
    action?: (value: string, index: number) => void
}