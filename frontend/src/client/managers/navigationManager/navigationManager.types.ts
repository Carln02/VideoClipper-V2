import {Point} from "turbodombuilder";

export interface NavigatableElement extends HTMLElement{
    transform(translation: Point, scale: number): void;
}