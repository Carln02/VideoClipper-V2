import {Point} from "turbodombuilder";
import {NavigationManager} from "./navigationManager";

export interface NavigatableElement extends HTMLElement{
    transform(translation: Point, scale: number): void;
}