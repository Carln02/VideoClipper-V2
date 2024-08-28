import {YMap} from "../conversionManagment/yjsEnhancement";
import {YValue} from "../conversionManagment/conversionManagement.types";

export type YConverterCallback = (jValue: any, name: string, parent: YMap) => YValue;