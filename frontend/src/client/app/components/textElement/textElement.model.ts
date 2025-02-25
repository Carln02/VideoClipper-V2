import {YComponentModel} from "../../../../yManagement/yModel/types/yComponentModel";
import {TextType} from "./textElement.types";
import {Coordinate} from "turbodombuilder";

export class TextElementModel extends YComponentModel {
    public get type(): TextType {
        return this.getData("type") as TextType;
    }

    public set type(value: TextType) {
        this.setData("type", value);
    }

    public get text(): string {
        return this.getData("text") as string;
    }

    public set text(value: string) {
        this.setData("text", value);
    }

    public get origin(): Coordinate {
        return this.getData("origin") as Coordinate;
    }

    public set origin(value: Coordinate) {
        this.setData("origin", value);
    }

    public get fontSize(): number {
        return this.getData("fontSize") as number;
    }

    public set fontSize(value: number) {
        this.setData("fontSize", value);
    }

    public get boxWidth(): number {
        return this.getData("boxWidth") as number;
    }

    public set boxWidth(value: number) {
        if (this.boxWidth == value) return;
        this.setData("boxWidth", value);
    }

    public get boxHeight() {
        return this.getData("boxHeight") as number;
    }

    public set boxHeight(value: number) {
        if (this.boxHeight == value) return;
        this.setData("boxHeight", value);
    }
}